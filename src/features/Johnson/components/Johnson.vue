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
          <p><strong>Nodos en camino crítico:</strong> {{ criticalPathNodes.join(', ') }}</p>
          <p v-if="hasCycles" class="warning-text"> Advertencia: El grafo tiene ciclos. Los resultados pueden ser inexactos.</p>
        </div>
        <svg class="graph-svg" ref="graphSvgJohnson" @wheel.prevent="handleWheel" @mousedown.self="startPan" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
          <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">
            <defs>
              <marker id="arrow-max" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path class d="M 0 0 L 10 5 L 0 10 z" :fill="arrowColor"></path>
              </marker>
            </defs>

            <g v-for="edge in edgesWithCoords" :key="edge.id">
              <path
                :d="edge.pathData"
                :stroke="edge.isInMaxPath ? '#dc2626' : (edge.color || edgeDefaultColor)"
                :stroke-width="edge.isInMaxPath ? '6' : '2'"
                fill="none"
                :marker-end="'url(#arrow-max)'"
                :class="{ 'max-path': edge.isInMaxPath }"
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

            <g v-for="node in augmentedNodes" :key="node.id"  
              :transform="`translate(${node.x}, ${node.y})`"
              :class="['node-group', node.shape, { 'max-path-node': node.isInMaxPath }]">
              <circle 
                v-if="node.shape === 'circle'" 
                :r="getNodeRadius(node)" 
                :fill="node.isInMaxPath ? maxPathNodeFill : node.color" 
                :stroke="node.isInMaxPath ? '#dc2626' : node.borderColor" 
                :stroke-width="node.isInMaxPath ? '3' : '2'"
              />
              <ellipse 
                v-else 
                :rx="getNodeEllipseRx(node)" 
                ry="25" 
                :fill="node.isInMaxPath ? maxPathNodeFill : node.color" 
                :stroke="node.isInMaxPath ? '#dc2626' : node.borderColor" 
                :stroke-width="node.isInMaxPath ? '3' : '2'"
              />
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
        <button @click="exportJSON" class="footer-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 20.1046 20.7893 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" stroke-width="2"/>
            <path d="M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Exportar JSON</span>
        </button>
        <button @click="triggerImportJSON" class="footer-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 20.1046 20.7893 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" stroke-width="2"/>
            <path d="M17 10L12 5L7 10M12 5V17" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Importar JSON</span>
        </button>
        <input type="file" ref="importFileInputJohnson" @change="importJSON" accept=".json" style="display: none;" />
        <button @click="clearAndClose" class="footer-btn danger-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Eliminar todo y cerrar</span>
        </button>
        <button @click="closeModal" class="footer-btn primary-btn">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const emit = defineEmits(['close', 'update-graph', 'clear-graph']);

const props = defineProps({
  theme: {
    type: String,
    default: 'light-theme'
  },
  nodes: {
    type: Array,
    required: true
  },
  edges: {
    type: Array,
    required: true
  }
});

const arrowColor = computed(() => props.theme === 'light-theme' ? '#8b7355' : '#c9b4a4');
const edgeDefaultColor = computed(() => props.theme === 'light-theme' ? '#8b7355' : '#c9b4a4');
const maxPathNodeFill = computed(() => props.theme === 'light-theme' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(239, 68, 68, 0.25)');

const inDegrees = computed(() => {
  const deg = {};
  props.nodes.forEach(n => deg[n.id] = 0);
  props.edges.forEach(e => {
    if (deg[e.to] !== undefined) deg[e.to]++;
  });
  return deg;
});

const topoOrder = computed(() => {
  const deg = { ...inDegrees.value };
  const queue = props.nodes.filter(n => deg[n.id] === 0);
  const order = [];
  const q = [...queue];
  while (q.length > 0) {
    const u = q.shift();
    order.push(u);
    props.edges.filter(e => e.from === u.id).forEach(e => {
      deg[e.to]--;
      if (deg[e.to] === 0) q.push(props.nodes.find(n => n.id === e.to));
    });
  }
  return order.length === props.nodes.length ? order : [];
});

const hasCycles = computed(() => topoOrder.value.length < props.nodes.length);

const esMap = computed(() => {
  if (topoOrder.value.length === 0) return new Map();
  const es = new Map(props.nodes.map(n => [n.id, inDegrees.value[n.id] === 0 ? 0 : Number.NEGATIVE_INFINITY]));
  topoOrder.value.forEach(node => {
    const nodeEs = es.get(node.id);
    props.edges.filter(e => e.from === node.id).forEach(edge => {
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
  props.nodes.forEach(n => deg[n.id] = 0);
  props.edges.forEach(e => {
    if (deg[e.from] !== undefined) deg[e.from]++;
  });
  return deg;
});

const reverseTopo = computed(() => topoOrder.value.length > 0 ? [...topoOrder.value].reverse() : []);

const lsMap = computed(() => {
  if (topoOrder.value.length === 0) return new Map();
  const ls = new Map(props.nodes.map(n => [n.id, Number.POSITIVE_INFINITY]));
  const sinks = props.nodes.filter(n => outDegrees.value[n.id] === 0);
  sinks.forEach(sink => ls.set(sink.id, esMap.value.get(sink.id) || 0));
  reverseTopo.value.forEach(node => {
    const incomingEdges = props.edges.filter(e => e.to === node.id);
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

// Calcular el camino crítico con nodos
const criticalPathData = computed(() => {
  if (topoOrder.value.length === 0 || hasCycles.value) return { path: [], nodes: [] };
  
  let maxSink = props.nodes.find(n => outDegrees.value[n.id] === 0);
  props.nodes.forEach(n => {
    if (outDegrees.value[n.id] === 0) {
      const esN = esMap.value.get(n.id) || 0;
      const esMax = esMap.value.get(maxSink.id) || 0;
      if (esN > esMax) maxSink = n;
    }
  });
  const path = [];
  const nodeLabels = [];
  let current = maxSink;
  
  while (current) {
    path.unshift(current.label);
    nodeLabels.unshift(current.label);
    
    if (inDegrees.value[current.id] === 0) break;
    
    const preds = props.edges.filter(e => e.to === current.id);
    let pred = null;
    
    for (let pEdge of preds) {
      const predNode = props.nodes.find(n => n.id === pEdge.from);
      const weight = Number(pEdge.value) || 0;
      if ((esMap.value.get(current.id) || 0) === (esMap.value.get(predNode.id) || 0) + weight) {
        pred = predNode;
        break;
      }
    }
    
    if (!pred) break;
    current = pred;
  }
  
  return { path, nodes: nodeLabels };
});

const criticalPath = computed(() => criticalPathData.value.path.join(' → '));
const criticalPathNodes = computed(() => criticalPathData.value.nodes);

const augmentedNodes = computed(() => {
  return props.nodes.map(n => {
    const es = esMap.value.get(n.id) || 0;
    const ls = lsMap.value.get(n.id) || 0;
    const slack = ls - es;
    const isInMaxPath = criticalPathNodes.value.includes(n.label);
    
    return {
      ...n,
      es,
      ls,
      slack,
      isInMaxPath
    };
  });
});

const augmentedEdges = computed(() => {
  return props.edges.map(e => {
    const slack = (lsMap.value.get(e.to) || 0) - (esMap.value.get(e.from) || 0) - (Number(e.value) || 0);
    const isInMaxPath = Math.abs(slack) < 0.001;
    
    return {
      ...e,
      slack,
      isInMaxPath
    };
  });
});

const projectDuration = computed(() => {
  const maxEs = Math.max(...props.nodes.map(n => esMap.value.get(n.id) || 0));
  return isFinite(maxEs) ? maxEs : 0;
});

const nodeMap = computed(() => new Map(augmentedNodes.value.map(node => [node.id, node])));

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
      const p2y = from.y + Math.sin(tangentAngle) * nodeRadius;
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

const minX = computed(() => Math.min(...augmentedNodes.value.map(n => n.x - getNodeRadius(n))));
const maxX = computed(() => Math.max(...augmentedNodes.value.map(n => n.x + getNodeRadius(n))));
const minY = computed(() => Math.min(...augmentedNodes.value.map(n => n.y - getNodeRadius(n) - 30)));
const maxY = computed(() => Math.max(...augmentedNodes.value.map(n => n.y + getNodeRadius(n) + 30)));

const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const lastMousePos = ref({ x: null, y: null });
const graphSvgJohnson = ref(null);
const importFileInputJohnson = ref(null);

const resetView = () => {
  const graphWidth = maxX.value - minX.value || 800;
  const graphHeight = maxY.value - minY.value || 600;
  const svgWidth = 900;
  const svgHeight = 600;
  zoomLevel.value = Math.min(svgWidth / graphWidth, svgHeight / graphHeight, 1);
  panX.value = (svgWidth - graphWidth * zoomLevel.value) / 2 - minX.value * zoomLevel.value;
  panY.value = (svgHeight - graphHeight * zoomLevel.value) / 2 - minY.value * zoomLevel.value + 50;
};

watch(() => [props.nodes, props.edges], resetView, { deep: true });

onMounted(resetView);

const handleWheel = (event) => {
  event.preventDefault();
  const delta = event.deltaY < 0 ? 1.1 : 0.9;
  zoomLevel.value = Math.max(0.3, Math.min(3, zoomLevel.value * delta));
};

const startPan = (event) => {
  const svgRect = graphSvgJohnson.value.getBoundingClientRect();
  lastMousePos.value = {
    x: event.clientX - svgRect.left,
    y: event.clientY - svgRect.top
  };
  isPanning.value = true;
};

const onDrag = (event) => {
  if (isPanning.value) {
    const svgRect = graphSvgJohnson.value.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    if (lastMousePos.value.x !== null && lastMousePos.value.y !== null) {
      const dx = (mouseX - lastMousePos.value.x) / zoomLevel.value;
      const dy = (mouseY - lastMousePos.value.y) / zoomLevel.value;
      panX.value += dx;
      panY.value += dy;
    }
    lastMousePos.value = { x: mouseX, y: mouseY };
  }
};

const stopDrag = () => {
  isPanning.value = false;
  lastMousePos.value = { x: null, y: null };
};

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

const exportJSON = () => {
  const fileName = prompt("Ingresa el nombre del archivo para guardar:", "grafo_johnson");
  if (!fileName) return;

  const nextNodeIdLocal = Math.max(0, ...props.nodes.map(n => n.id)) + 1 || 1;
  const nextEdgeIdLocal = Math.max(0, ...props.edges.map(e => e.id)) + 1 || 1;

  const data = { 
    nodes: props.nodes, 
    edges: props.edges, 
    nextNodeId: nextNodeIdLocal, 
    nextEdgeId: nextEdgeIdLocal, 
    currentTheme: props.theme,
    canvasBackgroundStyle: 'grid',
    canvasBackgroundColor: props.theme === 'light-theme' ? '#ffffff' : '#333333',
    zoomLevel: 1,
    panX: 0,
    panY: 0
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.trim()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const triggerImportJSON = () => {
  importFileInputJohnson.value.click();
};

const importJSON = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      emit('update-graph', data);
      alert("Grafo importado exitosamente.");
    } catch (error) {
      console.error("Error al importar el JSON:", error);
      alert("Error al importar el archivo JSON. Asegúrate de que sea un formato válido.");
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

const clearAndClose = () => {
  if (confirm("¿Estás seguro de que quieres borrar todo el grafo? Esta acción no se puede deshacer.")) {
    emit('clear-graph');
    closeModal();
  }
};
</script>

<style scoped>
.node-slack-label {
  font-size: 12px;
  fill: v-bind('theme === "light-theme" ? "#1a73e8" : "#8ab4f8"');
  pointer-events: none;
}

.johnson-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.281);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
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
}

.johnson-modal-body p {
  color: #2c2c2c;
}

.dark-theme .johnson-modal-body p {
  color: #e0e0e0;
}

.light-theme .johnson-modal-content  {
  background: linear-gradient(180deg, rgba(253, 246, 236, 0.98) 0%, rgba(248, 238, 226, 0.95) 100%);
  border: 2px solid #c9a887;
}

.dark-theme .johnson-modal-content  {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.98) 0%, rgba(35, 35, 35, 0.95) 100%);
  border: 2px solid #242a31;
}

.johnson-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  flex-shrink: 0;
}

.light-theme .johnson-modal-header {
  background: rgba(255, 249, 242, 0.9);
  border-bottom: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .johnson-modal-header {
  background: rgba(58, 58, 58, 0.9);
  border-bottom: 1px solid #555;
}

.johnson-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.light-theme .johnson-modal-header h2 {
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .johnson-modal-header h2 {
  background: linear-gradient(135deg, #c9b4a4 0%, #e0c9b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  transition: all 0.3s ease;
}

.light-theme .close-button {
  color: #888;
}

.dark-theme .close-button {
  color: #bbb;
}

.close-button:hover {
  transform: rotate(90deg);
}

.light-theme .close-button:hover {
  color: #000;
}

.dark-theme .close-button:hover {
  color: #fff;
}

/* Body */
.johnson-modal-body {
  flex-grow: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.dark-theme .johnson-modal-body {
  background-color: #333;
}

/* Info Panel */
.info-panel {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.light-theme .info-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(224, 201, 182, 0.4);
  color: #333;
}

.dark-theme .info-panel {
  background: rgba(58, 58, 58, 0.95);
  border: 1px solid #555;
  color: #e0e0e0;
}

.info-panel p {
  margin: 6px 0;
}

.warning-text {
  color: #f59e0b;
  font-weight: 600;
}

/* SVG Graph */
.graph-svg {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: grab;
}

.graph-svg:active {
  cursor: grabbing;
}

.light-theme .graph-svg {
  background-color: #ffffff;
  border: 2px solid #c9a887;
}

.dark-theme .graph-svg {
  background-color: #2a2a2a;
  border: 2px solid #3a4b5f;
}

/* Edge Labels */
.edge-label {
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.light-theme .edge-label {
  fill: #333;
}

.dark-theme .edge-label {
  fill: #e0e0e0;
}

.edge-slack-label {
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}

.light-theme .edge-slack-label {
  fill: #1a73e8;
}

.dark-theme .edge-slack-label {
  fill: #8ab4f8;
}

/* Node Labels */
.node-label {
  font-weight: bold;
  pointer-events: none;
}

.light-theme .node-label {
  fill: #000;
}

.dark-theme .node-label {
  fill: #fff;
}

.node-slack-label {
  font-size: 12px;
  pointer-events: none;
}

.light-theme .node-slack-label {
  fill: #1a73e8;
}

.dark-theme .node-slack-label {
  fill: #8ab4f8;
}

.node-group {
  pointer-events: none;
}

/* Camino Máximo (Crítico) */
.max-path {
  stroke: rgba(37, 100, 235) !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.5));
  animation: pulse-path 2s ease-in-out infinite;
}

@keyframes pulse-path {
  0%, 100% {
    stroke-opacity: 1;
  }
  50% {
    stroke-opacity: 0.7;
  }
}

.max-path-node circle,
.max-path-node ellipse {
  stroke: rgba(37, 100, 235) !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 6px rgba(37, 100, 235, 0.4));
}

/* Footer */
.johnson-modal-footer {
  padding: 15px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.light-theme .johnson-modal-footer {
  background: rgba(255, 249, 242, 0.9);
  border-top: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .johnson-modal-footer {
  background: rgba(58, 58, 58, 0.9);
  border-top: 1px solid #555;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid;
  position: relative;
  overflow: hidden;
}

.footer-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.footer-btn:hover::before {
  left: 100%;
}

.footer-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.footer-btn:hover svg {
  transform: scale(1.1);
}

.light-theme .footer-btn {
  background: rgba(255, 249, 242, 0.9);
  border-color: rgba(224, 201, 182, 0.5);
  color: #8b7355;
}

.dark-theme .footer-btn {
  background: rgba(58, 58, 58, 0.9);
  border-color: rgba(70, 70, 70, 0.5);
  color: #c9b4a4;
}

.light-theme .footer-btn:hover {
  background: rgba(243, 232, 221, 0.95);
  border-color: rgba(201, 168, 135, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
}

.dark-theme .footer-btn:hover {
  background: rgba(74, 74, 74, 0.95);
  border-color: rgba(139, 115, 85, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 180, 164, 0.15);
}

.primary-btn {
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%) !important;
  border-color: #a08970 !important;
  color: white !important;
}

.light-theme .primary-btn:hover {
  background: linear-gradient(135deg, #7a6449 0%, #b89776 100%) !important;
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
}

.dark-theme .primary-btn {
  background: linear-gradient(135deg, #c9b4a4 0%, #e0c9b6 100%) !important;
  border-color: #d4baaa !important;
  color: #2a2a2a !important;
}

.dark-theme .primary-btn:hover {
  background: linear-gradient(135deg, #b8a394 0%, #cfb8a6 100%) !important;
}

.danger-btn {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
  border-color: #b91c1c !important;
  color: white !important;
}

.danger-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%) !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .johnson-modal-content {
    width: 95%;
    height: 95%;
  }

  .johnson-modal-header h2 {
    font-size: 1.2rem;
  }

  .footer-btn span {
    display: none;
  }

  .footer-btn {
    padding: 10px;
  }

  .info-panel {
    font-size: 12px;
  }
}
</style>