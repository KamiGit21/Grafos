<template>
  <div class="johnson-modal-overlay" @click.self="closeModal">
    <div :class="['johnson-modal-content', theme]">
      <header class="johnson-modal-header">
        <h2>Algoritmo de Johnson (CPM)</h2>
        <button class="close-button" @click="closeModal" title="Cerrar">×</button>
      </header>
      
      <main class="johnson-modal-body" v-if="augmentedNodes.length > 0 && topoOrder.length > 0">
        <div class="info-panel">
          <p><strong>Duración total del proyecto:</strong> {{ Math.round(projectDuration) }}</p>
          <p><strong>Camino crítico:</strong> {{ criticalPath }}</p>
          <p v-if="hasCycles">¡Advertencia! El grafo tiene ciclos. Los resultados pueden ser inexactos.</p>
        </div>
        <svg class="graph-svg" width="900" height="700">
          <g :transform="`scale(${scale}) translate(${fitPanX}, ${fitPanY})`">
            <defs>
              <marker id="arrow" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" :fill="arrowColor"></path>
              </marker>
            </defs>

            <g v-for="edge in edgesWithCoords" :key="edge.id">
              <path
                :d="edge.pathData"
                :stroke="edge.color || '#555'"
                stroke-width="2"
                fill="none"
                :marker-end="'url(#arrow)'"
                :class="{ 'critical': edge.slack === 0 }"
              />
              <text
                :x="edge.textX"
                :y="edge.textY"
                text-anchor="middle"
                class="edge-label"
              >
                {{ edge.value }}
              </text>
              <text
                :x="edge.textSlackX"
                :y="edge.textSlackY"
                text-anchor="middle"
                class="edge-slack-label"
              >
                h={{ Math.round(edge.slack) }}
              </text>
            </g>

            <g v-for="node in normalizedNodes" :key="node.id"  
              :transform="`translate(${node.x}, ${node.y})`"
              :class="['node-group', node.shape, { 'critical': node.slack === 0 }]">
              <circle v-if="node.shape === 'circle'" :r="getNodeRadius(node)" :fill="node.color" :stroke="node.borderColor" stroke-width="2"/>
              <ellipse v-else :rx="getNodeEllipseRx(node)" ry="25" :fill="node.color" :stroke="node.borderColor" stroke-width="2"/>
              <text class="node-label" text-anchor="middle" y="-20">{{ node.label }}</text>
              <text text-anchor="middle" y="5" font-size="12">{{ Math.round(node.es) }} | {{ isFinite(node.ls) ? Math.round(node.ls) : '∞' }}</text>
              <text text-anchor="middle" y="25" font-size="12" class="node-slack-label">h={{ Math.round(node.slack) }}</text>
            </g>
          </g>
        </svg>
      </main>

      <main v-else class="johnson-modal-body">
        <p v-if="topoOrder.length === 0">No hay un grafo válido para calcular (debe ser un DAG dirigido sin ciclos).</p>
        <p v-else>El grafo está vacío. Agrega nodos y aristas dirigidas con valores numéricos.</p>
      </main>

      <footer class="johnson-modal-footer">
        <!--<button @click="exportImage">Exportar Imagen</button>-->
        <button @click="exportJson">Exportar JSON</button>
        <input type="file" ref="fileInput" style="display: none;" accept=".json" @change="importJson" />
        <button @click="triggerImport">Importar JSON</button>
        <button @click="clearGraph">Eliminar Todo</button>
        <button @click="closeModal">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import jsPDF from 'jspdf';

const emit = defineEmits(['close']);

const props = defineProps({
  theme: {
    type: String,
    default: 'light-theme'
  }
});

// Estado interno para los nodos y aristas generados por el algoritmo
const internalNodes = ref([]);
const internalEdges = ref([]);

// Generar un grafo de ejemplo con 4 nodos para el algoritmo de Johnson
const generateExampleGraph = () => {
  const nodes = [
    { id: '1', label: 'A', x: 100, y: 100, shape: 'circle', color: '#fff', borderColor: '#000' },
    { id: '2', label: 'B', x: 250, y: 100, shape: 'circle', color: '#fff', borderColor: '#000' },
    { id: '3', label: 'C', x: 250, y: 250, shape: 'circle', color: '#fff', borderColor: '#000' },
    { id: '4', label: 'D', x: 400, y: 100, shape: 'circle', color: '#fff', borderColor: '#000' }
  ];
  const edges = [
    { id: 'e1', from: '1', to: '2', value: 5 },
    { id: 'e2', from: '2', to: '4', value: 3 },
    { id: 'e3', from: '1', to: '3', value: 6 },
    { id: 'e4', from: '3', to: '4', value: 2 }
  ];
  return { nodes, edges };
};

// Inicializar el grafo con un ejemplo
const initializeGraph = () => {
  const { nodes, edges } = generateExampleGraph();
  internalNodes.value = nodes;
  internalEdges.value = edges;
};

// Llamar a la inicialización al montar el componente
initializeGraph();

const fileInput = ref(null);

const arrowColor = computed(() => props.theme === 'light-theme' ? '#555' : '#ccc');

const inDegrees = computed(() => {
  const deg = {};
  internalNodes.value.forEach(n => deg[n.id] = 0);
  internalEdges.value.forEach(e => {
    if (deg[e.to] !== undefined) deg[e.to]++;
  });
  return deg;
});

const topoOrder = computed(() => {
  const deg = { ...inDegrees.value };
  const queue = internalNodes.value.filter(n => deg[n.id] === 0);
  const order = [];
  const q = [...queue];
  while (q.length > 0) {
    const u = q.shift();
    order.push(u);
    internalEdges.value.filter(e => e.from === u.id).forEach(e => {
      deg[e.to]--;
      if (deg[e.to] === 0) q.push(internalNodes.value.find(n => n.id === e.to));
    });
  }
  return order.length === internalNodes.value.length ? order : [];
});

const hasCycles = computed(() => topoOrder.value.length < internalNodes.value.length);

const esMap = computed(() => {
  if (topoOrder.value.length === 0) return new Map();
  const es = new Map(internalNodes.value.map(n => [n.id, inDegrees.value[n.id] === 0 ? 0 : Number.NEGATIVE_INFINITY]));
  topoOrder.value.forEach(node => {
    const nodeEs = es.get(node.id);
    internalEdges.value.filter(e => e.from === node.id).forEach(edge => {
      const weight = Number(edge.value) || 0;
      const newEs = nodeEs + weight;
      const curr = es.get(edge.to);
      if (newEs > curr) es.set(edge.to, newEs);
    });
  });
  return es;
});

const outDegrees = computed(() => {
  const deg = {};
  internalNodes.value.forEach(n => deg[n.id] = 0);
  internalEdges.value.forEach(e => {
    if (deg[e.from] !== undefined) deg[e.from]++;
  });
  return deg;
});

const reverseTopo = computed(() => topoOrder.value.length > 0 ? [...topoOrder.value].reverse() : []);

const lsMap = computed(() => {
  if (topoOrder.value.length === 0) return new Map();
  const ls = new Map(internalNodes.value.map(n => [n.id, Number.POSITIVE_INFINITY]));
  const sinks = internalNodes.value.filter(n => outDegrees.value[n.id] === 0);
  sinks.forEach(sink => ls.set(sink.id, esMap.value.get(sink.id) || 0));
  reverseTopo.value.forEach(node => {
    const incomingEdges = internalEdges.value.filter(e => e.to === node.id);
    incomingEdges.forEach(edge => {
      const predId = edge.from;
      const weight = Number(edge.value) || 0;
      const newLs = (ls.get(node.id) || 0) - weight;
      const currLs = ls.get(predId);
      if (newLs < currLs) {
        ls.set(predId, newLs);
      }
    });
  });
  return ls;
});

const augmentedNodes = computed(() => {
  return internalNodes.value.map(n => ({
    ...n,
    es: esMap.value.get(n.id) || 0,
    ls: lsMap.value.get(n.id) || 0,
    slack: (lsMap.value.get(n.id) || 0) - (esMap.value.get(n.id) || 0)
  }));
});

const minX = computed(() => Math.min(...augmentedNodes.value.map(n => n.x - getNodeRadius(n))));
const minY = computed(() => Math.min(...augmentedNodes.value.map(n => n.y - getNodeRadius(n) - 30)));
const maxX = computed(() => Math.max(...augmentedNodes.value.map(n => n.x + getNodeRadius(n))));
const maxY = computed(() => Math.max(...augmentedNodes.value.map(n => n.y + getNodeRadius(n) + 30)));

const normalizedNodes = computed(() => {
  return augmentedNodes.value.map(node => ({
    ...node,
    x: node.x - minX.value,
    y: node.y - minY.value
  }));
});

const nodeMap = computed(() => new Map(normalizedNodes.value.map(node => [node.id, node])));

const edgesWithCoords = computed(() => {
  return augmentedEdges.value.map(edge => {
    const from = nodeMap.value.get(edge.from);
    const to = nodeMap.value.get(edge.to);
    if (!from || !to) return null;

    let commonProps = { ...edge };

    if (from.id === to.id) {
      const nodeRadius = getNodeRadius(from);
      const loopRadius = (edge.loopSize || 40) / 2;
      const loopAngle = edge.loopAngle || 0;
      const angleRad = (loopAngle - 90) * (Math.PI / 180);
      const tangentAngle = angleRad + Math.PI / 2;
      const p1x = from.x + Math.cos(tangentAngle) * nodeRadius;
      const p1y = from.y + Math.sin(tangentAngle) * nodeRadius;
      const p2x = from.x - Math.cos(tangentAngle) * nodeRadius;
      const p2y = from.y - Math.sin(tangentAngle) * nodeRadius;
      const controlPointX = from.x + Math.cos(angleRad) * (nodeRadius + 2 * loopRadius);
      const controlPointY = from.y + Math.sin(angleRad) * (nodeRadius + 2 * loopRadius);
      let endPointX = p1x, endPointY = p1y;
      const dx = p1x - controlPointX;
      const dy = p1y - controlPointY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const ratio = (dist - 10) / dist;
      endPointX = controlPointX + dx * ratio;
      endPointY = controlPointY + dy * ratio;
      commonProps.pathData = `M ${p2x} ${p2y} A ${loopRadius} ${loopRadius} 0 1 1 ${endPointX} ${endPointY}`;
      commonProps.controlPointX = controlPointX;
      commonProps.controlPointY = controlPointY;
      commonProps.textX = controlPointX;
      commonProps.textY = controlPointY;
      commonProps.textSlackX = controlPointX + 20;
      commonProps.textSlackY = controlPointY + 5;
    } else {
      const toNodeRadius = to.shape === 'circle' ? getNodeRadius(to) : 30;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const nx = -dy / len;
      const ny = dx / len;
      const controlPointX = midX + nx * (edge.curveOffset || 0);
      const controlPointY = midY + ny * (edge.curveOffset || 0);
      let endPointX = to.x;
      let endPointY = to.y;
      const cdx = to.x - controlPointX;
      const cdy = to.y - controlPointY;
      const cdist = Math.sqrt(cdx*cdx + cdy*cdy);
      if (cdist > 0) {
        const ratio = (cdist - toNodeRadius - 5) / cdist;
        endPointX = controlPointX + cdx * ratio;
        endPointY = controlPointY + cdy * ratio;
      }
      commonProps.pathData = `M ${from.x} ${from.y} Q ${controlPointX} ${controlPointY} ${endPointX} ${endPointY}`;
      commonProps.controlPointX = controlPointX;
      commonProps.controlPointY = controlPointY;
      commonProps.textX = (from.x + 2 * controlPointX + to.x) / 4;
      commonProps.textY = (from.y + 2 * controlPointY + to.y) / 4;
      commonProps.textSlackX = commonProps.textX + 20;
      commonProps.textSlackY = commonProps.textY;
    }
    return commonProps;
  }).filter(e => e !== null);
});

const augmentedEdges = computed(() => {
  return internalEdges.value.map(e => ({
    ...e,
    slack: (lsMap.value.get(e.to) || 0) - (esMap.value.get(e.from) || 0) - (Number(e.value) || 0)
  }));
});

const projectDuration = computed(() => {
  const maxEs = Math.max(...internalNodes.value.map(n => esMap.value.get(n.id) || 0));
  return isFinite(maxEs) ? maxEs : 0;
});

const criticalPath = computed(() => {
  if (topoOrder.value.length === 0 || hasCycles.value) return 'Grafo inválido (ciclos detectados)';
  let maxSink = internalNodes.value.find(n => outDegrees.value[n.id] === 0);
  internalNodes.value.forEach(n => {
    if (outDegrees.value[n.id] === 0) {
      const esN = esMap.value.get(n.id) || 0;
      const esMax = esMap.value.get(maxSink.id) || 0;
      if (esN > esMax) maxSink = n;
    }
  });
  const path = [];
  let current = maxSink;
  while (current) {
    path.unshift(current.label);
    if (inDegrees.value[current.id] === 0) break;
    const preds = internalEdges.value.filter(e => e.to === current.id);
    let pred = null;
    for (let pEdge of preds) {
      const predNode = internalNodes.value.find(n => n.id === pEdge.from);
      const weight = Number(pEdge.value) || 0;
      if ((esMap.value.get(current.id) || 0) === (esMap.value.get(predNode.id) || 0) + weight) {
        pred = predNode;
        break;
      }
    }
    if (!pred) break;
    current = pred;
  }
  return path.join(' → ');
});

const scale = computed(() => {
  const svgWidth = 900;
  const svgHeight = 600;
  const graphWidth = maxX.value - minX.value;
  const graphHeight = maxY.value - minY.value;
  const padding = 50;
  const scaleX = graphWidth > 0 ? (svgWidth - 2 * padding) / graphWidth : 1;
  const scaleY = graphHeight > 0 ? (svgHeight - 2 * padding) / graphHeight : 1;
  return Math.min(scaleX, scaleY, 1);
});

const fitPanX = computed(() => {
  const graphWidth = (maxX.value - minX.value) * scale.value;
  return (900 - graphWidth) / 2 / scale.value;
});

const fitPanY = computed(() => {
  const graphHeight = (maxY.value - minY.value) * scale.value;
  return (600 - graphHeight) / 2 / scale.value + 50;
});

const getNodeRadius = (node) => {
  const baseRadius = 15;
  const extraPerChar = node.label.length > 2 ? (node.label.length - 2) * 3 : 0;
  return 20 + extraPerChar;
};

const getNodeEllipseRx = (node) => {
  const baseRx = 25;
  const extraPerChar = node.label.length > 2 ? (node.label.length - 2) * 4 : 0;
  return 35 + extraPerChar;
};

const closeModal = () => {
  emit('close');
};

const exportImage = async () => {
  const fileName = prompt("Ingresa el nombre para la imagen:", "johnson_result");
  if (!fileName || fileName.trim() === "") return;

  const svgElement = document.querySelector('.graph-svg');
  if (!svgElement) {
    alert("Error: No se encontró el elemento SVG.");
    return;
  }

  const clonedSvg = svgElement.cloneNode(true);
  const svgRect = svgElement.getBoundingClientRect();
  clonedSvg.setAttribute('width', svgRect.width);
  clonedSvg.setAttribute('height', svgRect.height);
  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const g = clonedSvg.querySelector('g');
  if (g) {
    g.setAttribute('transform', `scale(${scale.value}) translate(${fitPanX.value}, ${fitPanY.value})`);
  }

  const backgroundStyle = `
    <rect x="0" y="0" width="900" height="700" 
      fill="${props.theme === 'light-theme' ? '#ffffff' : '#2a2a2a'}" />
  `;
  const parser = new DOMParser();
  const backgroundElement = parser.parseFromString(backgroundStyle, 'image/svg+xml').documentElement;
  clonedSvg.insertBefore(backgroundElement, clonedSvg.firstChild);

  const infoPanel = document.querySelector('.info-panel');
  if (infoPanel) {
    const infoText = `
      <foreignObject x="0" y="10" width="900" height="80">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 14px; color: ${props.theme === 'light-theme' ? '#333' : '#e0e0e0'}; text-align: center;">
          <p><strong>Duración total del proyecto:</strong> ${Math.round(projectDuration.value)}</p>
          <p><strong>Camino crítico:</strong> ${criticalPath.value}</p>
          ${hasCycles.value ? '<p style="color: #e74c3c;">¡Advertencia! El grafo tiene ciclos. Los resultados pueden ser inexactos.</p>' : ''}
        </div>
      </foreignObject>
    `;
    clonedSvg.insertBefore(parser.parseFromString(infoText, 'image/svg+xml').documentElement, clonedSvg.firstChild);
  }

  const svgString = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.width = svgRect.width;
  img.height = svgRect.height;

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgRect.width * 2;
    canvas.height = svgRect.height * 2;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const link = document.createElement('a');
    link.download = `${fileName.trim()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    URL.revokeObjectURL(url);
  };

  img.onerror = (err) => {
    URL.revokeObjectURL(url);
    console.error("Error al cargar el SVG como imagen.", err);
    alert("Ocurrió un error al generar la imagen.");
  };

  img.src = url;
};

const exportJson = () => {
  const graphData = {
    nodes: internalNodes.value,
    edges: internalEdges.value
  };
  const jsonString = JSON.stringify(graphData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'johnson_graph.json';
  link.click();
  URL.revokeObjectURL(url);
};

const triggerImport = () => {
  fileInput.value.click();
};

const importJson = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const graphData = JSON.parse(e.target.result);
      if (graphData.nodes && Array.isArray(graphData.nodes) && graphData.edges && Array.isArray(graphData.edges)) {
        // Validar que los valores de las aristas sean >= 1
        const invalidEdges = graphData.edges.filter(edge => !edge.value || edge.value < 1);
        if (invalidEdges.length > 0) {
          alert('Error: El archivo JSON contiene aristas con valores menores a 1 o no numéricos.');
          return;
        }
        internalNodes.value = graphData.nodes;
        internalEdges.value = graphData.edges;
      } else {
        alert('Error: El archivo JSON no tiene el formato correcto. Debe contener "nodes" y "edges" como arreglos.');
      }
    } catch (err) {
      console.error('Error al parsear JSON:', err);
      alert('Error al leer el archivo JSON.');
    }
    fileInput.value.value = ''; // Reset input
  };
  reader.onerror = () => {
    alert('Error al leer el archivo.');
    fileInput.value.value = '';
  };
  reader.readAsText(file);
};

const clearGraph = () => {
  internalNodes.value = [];
  internalEdges.value = [];
};
</script>

<style scoped>
.node-slack-label {
  font-size: 12px;
  fill: v-bind('theme === "light-theme" ? "#1a73e8" : "#8ab4f8"');
  pointer-events: none;
}

.critical path {
  stroke: red !important;
  stroke-width: 3 !important;
}

.critical circle, .critical ellipse {
  fill: rgba(255, 0, 0, 0.2) !important;
  stroke: red !important;
  stroke-width: 3 !important;
}

.johnson-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.johnson-modal-content {
  width: 90%;
  height: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  overflow: hidden;
  background-color: v-bind('theme === "light-theme" ? "#f9f9f9" : "#3a3a3a"');
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab4ff"');
}

.johnson-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  flex-shrink: 0;
  border-bottom: 1px solid v-bind('theme === "light-theme" ? "#e0e0e0" : "#555"');
}

.johnson-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  color: v-bind('theme === "light-theme" ? "#888" : "#bbb"');
}

.close-button:hover {
  color: v-bind('theme === "light-theme" ? "#000" : "#fff"');
}

.johnson-modal-body {
  flex-grow: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.info-panel {
  padding: 10px;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.8)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 5px;
  margin-bottom: 10px;
  text-align: center;
  border: 1px solid v-bind('theme === "light-theme" ? "#ddd" : "#555"');
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
}

.graph-svg {
  flex-grow: 1;
  background-color: v-bind('theme === "light-theme" ? "#ffffff" : "#2a2a2a"');
  border-radius: 5px;
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab4ff"');
}

.edge-label, .edge-slack-label {
  font-size: 12px;
  fill: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  pointer-events: none;
  font-weight: bold;
}

.edge-slack-label {
  fill: v-bind('theme === "light-theme" ? "#1a73e8" : "#8ab4f8"');
}

.node-label {
  font-weight: bold;
  fill: v-bind('theme === "light-theme" ? "#000" : "#fff"');
  pointer-events: none;
  font-size: 14px;
}

.node-group {
  pointer-events: none;
}

.johnson-modal-footer {
  padding: 15px;
  text-align: center;
  flex-shrink: 0;
  border-top: 1px solid v-bind('theme === "light-theme" ? "#e0e0e0" : "#555"');
  background-color: v-bind('theme === "light-theme" ? "#f9f9f9" : "#3a3a3a"');
}

.johnson-modal-footer button {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  background-color: v-bind('theme === "light-theme" ? "#f0f0f0" : "#4f4f4f"');
  border: 1px solid v-bind('theme === "light-theme" ? "#ccc" : "#666"');
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  margin: 0 5px;
}

.johnson-modal-footer button:hover {
  background-color: v-bind('theme === "light-theme" ? "#e0e0e0" : "#5a5a5a"');
}
</style>