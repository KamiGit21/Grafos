<template>
  <div class="johnson-modal-overlay" @click.self="closeModal">
    <div :class="['johnson-modal-content', theme]">
      <header class="johnson-modal-header">
        <h2>Algoritmo de Johnson (Minimización)</h2>
        <button class="close-button" @click="closeModal" title="Cerrar">×</button>
      </header>
      
      <main class="johnson-modal-body" v-if="augmentedNodes.length > 0 && topoOrder.length > 0">
        <div class="info-panel">
          <p><strong>Duración mínima del proyecto:</strong> {{ Math.round(projectDuration) }}</p>
          <p><strong>Camino mínimo:</strong> {{ minPath.join(' → ') }}</p>
          <p><strong>Nodos en camino mínimo:</strong> {{ minPathNodes.join(', ') }}</p>
          <p v-if="hasCycles">¡Advertencia! El grafo tiene ciclos. Los resultados pueden ser inexactos.</p>
        </div>
        <svg class="graph-svg" ref="graphSvgJohnson" @wheel.prevent="handleWheel" @mousedown.self="startPan" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
          <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
                :class="{ 'min-path': edge.isInMinPath }"
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
              :class="['node-group', node.shape, { 'min-path-node': node.isInMinPath }]">
              <circle v-if="node.shape === 'circle'" :r="getNodeRadius(node)" :fill="node.color" :stroke="node.borderColor" stroke-width="2"/>
              <ellipse v-else :rx="getNodeEllipseRx(node)" ry="25" :fill="node.color" :stroke="node.borderColor" stroke-width="2"/>
              <text class="node-label" text-anchor="middle" y="-20">{{ node.label }}</text>
              <text text-anchor="middle" y="5" font-size="12">{{ Math.round(node.ef) }} | {{ isFinite(node.lf) ? Math.round(node.lf) : '∞' }}</text>
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
        <button @click="exportJSON">Exportar JSON</button>
        <button @click="triggerImportJSON">Importar JSON</button>
        <input type="file" ref="importFileInputJohnson" @change="importJSON" accept=".json" style="display: none;" />
        <button @click="clearAndClose">Eliminar todo y cerrar</button>
        <button @click="closeModal">Cerrar</button>
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

const arrowColor = computed(() => props.theme === 'light-theme' ? '#555' : '#ccc');

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

// Para minimización: Early Finish (EF) - tiempo más temprano de finalización
const efMap = computed(() => {
  if (topoOrder.value.length === 0) return new Map();
  const ef = new Map(props.nodes.map(n => [n.id, inDegrees.value[n.id] === 0 ? 0 : Number.POSITIVE_INFINITY]));
  
  topoOrder.value.forEach(node => {
    const nodeEf = ef.get(node.id);
    
    // Actualizar los sucesores (tomando el mínimo)
    props.edges.filter(e => e.from === node.id).forEach(edge => {
      const weight = Number(edge.value) || 0;
      const newEf = nodeEf + weight;
      const currentEf = ef.get(edge.to);
      if (newEf < currentEf) {
        ef.set(edge.to, newEf);
      }
    });
  });
  
  return ef;
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

// Para minimización: Late Finish (LF) - tiempo más tardío de finalización (usando el mayor valor posible)
const lfMap = computed(() => {
  if (topoOrder.value.length === 0) return new Map();
  const lf = new Map(props.nodes.map(n => [n.id, Number.NEGATIVE_INFINITY]));
  
  // Para nodos sumidero (sin sucesores), LF = EF (pero usando el mayor valor posible entre todos los sumideros)
  const sinkNodes = props.nodes.filter(n => outDegrees.value[n.id] === 0);
  const maxEfSink = Math.max(...sinkNodes.map(n => efMap.value.get(n.id) || 0));
  
  sinkNodes.forEach(node => {
    // Usar el mayor EF entre todos los sumideros como LF para cada sumidero
    lf.set(node.id, maxEfSink);
  });
  
  // Procesar en orden topológico inverso (tomando el máximo)
  reverseTopo.value.forEach(node => {
    const nodeLf = lf.get(node.id);
    
    // Actualizar predecesores (tomando el máximo)
    props.edges.filter(e => e.to === node.id).forEach(edge => {
      const weight = Number(edge.value) || 0;
      const newLf = nodeLf - weight;
      const currentLf = lf.get(edge.from);
      
      // Tomar el mayor valor posible
      if (newLf > currentLf) {
        lf.set(edge.from, newLf);
      }
    });
  });
  
  return lf;
});

// Encontrar el camino mínimo (secuencia de nodos con holgura cero)
const minPath = computed(() => {
  if (topoOrder.value.length === 0 || hasCycles.value) return [];
  
  const path = [];
  const visited = new Set();
  
  // Encontrar nodos iniciales (sin predecesores)
  const startNodes = props.nodes.filter(n => inDegrees.value[n.id] === 0);
  if (startNodes.length === 0) return [];
  
  // Función recursiva para encontrar el camino mínimo
  const findMinPath = (node) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    
    path.push(node.label);
    
    // Encontrar sucesores con holgura cero
    const outgoingEdges = props.edges.filter(e => e.from === node.id);
    const zeroSlackEdges = outgoingEdges.filter(edge => {
      const edgeSlack = (lfMap.value.get(edge.to) || 0) - (efMap.value.get(edge.from) || 0) - (Number(edge.value) || 0);
      return Math.abs(edgeSlack) < 0.001; // Considerar cero con tolerancia
    });
    
    if (zeroSlackEdges.length > 0) {
      // Seguir por la primera arista con holgura cero
      const nextEdge = zeroSlackEdges[0];
      const nextNode = props.nodes.find(n => n.id === nextEdge.to);
      if (nextNode) {
        findMinPath(nextNode);
      }
    }
  };
  
  // Empezar desde el primer nodo inicial
  findMinPath(startNodes[0]);
  
  return path;
});

const minPathNodes = computed(() => {
  return minPath.value;
});

const augmentedNodes = computed(() => {
  return props.nodes.map(n => {
    const ef = efMap.value.get(n.id) || 0;
    const lf = lfMap.value.get(n.id) || 0;
    const slack = lf - ef;
    const isInMinPath = minPath.value.includes(n.label);
    
    return {
      ...n,
      ef,
      lf,
      slack,
      isInMinPath
    };
  });
});

const augmentedEdges = computed(() => {
  return props.edges.map(e => {
    const slack = (lfMap.value.get(e.to) || 0) - (efMap.value.get(e.from) || 0) - (Number(e.value) || 0);
    const isInMinPath = Math.abs(slack) < 0.001; // Considerar cero con tolerancia
    
    return {
      ...e,
      slack,
      isInMinPath
    };
  });
});

const projectDuration = computed(() => {
  if (props.nodes.length === 0) return 0;
  
  // La duración del proyecto es el máximo EF entre todos los nodos sumidero
  const sinkNodes = props.nodes.filter(n => outDegrees.value[n.id] === 0);
  const maxEf = sinkNodes.length > 0 ? Math.max(...sinkNodes.map(n => efMap.value.get(n.id) || 0)) : 0;
  return isFinite(maxEf) ? maxEf : 0;
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
  const fileName = prompt("Ingresa el nombre del archivo para guardar:", "grafo_johnson_min");
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

.min-path {
  stroke: blue !important;
  stroke-width: 3 !important;
}

.min-path-node circle, .min-path-node ellipse {
  fill: rgba(0, 0, 255, 0.2) !important;
  stroke: blue !important;
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
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
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
  width: 100%;
  height: 100%;
  background-color: v-bind('theme === "light-theme" ? "#ffffff" : "#2a2a2a"');
  border-radius: 5px;
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
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