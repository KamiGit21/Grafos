<template>
  <div class="dijkstra-modal-overlay" @click.self="closeModal">
    <div :class="['dijkstra-modal-content', theme]">
      <header class="dijkstra-modal-header">
        <h2>Algoritmo de Dijkstra (Camino Mínimo)</h2>
        <button class="close-button" @click="closeModal" title="Cerrar">×</button>
      </header>
      
      <main class="dijkstra-modal-body" v-if="nodes.length > 0">
        <div class="node-selection-panel">
          <div class="selection-group">
            <label for="startNode">Nodo Inicial:</label>
            <select id="startNode" v-model="selectedStart" @change="calculateDijkstra">
              <option value="">Seleccionar...</option>
              <option v-for="node in nodes" :key="node.id" :value="node.id">
                {{ node.label }}
              </option>
            </select>
          </div>
          
          <div class="selection-group">
            <label for="endNode">Nodo Final:</label>
            <select id="endNode" v-model="selectedEnd" @change="calculateDijkstra">
              <option value="">Seleccionar...</option>
              <option v-for="node in nodes" :key="node.id" :value="node.id">
                {{ node.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="info-panel" v-if="selectedStart && selectedEnd && pathExists">
          <p><strong>Distancia mínima:</strong> {{ Math.round(minDistance * 100) / 100 }}</p>
          <p><strong>Camino mínimo:</strong> {{ minPath.join(' → ') }}</p>
          <p v-if="!pathExists && selectedStart && selectedEnd" class="warning-text">
            No existe un camino entre los nodos seleccionados.
          </p>
        </div>

        <div class="info-panel warning-text" v-else-if="selectedStart && selectedEnd && !pathExists">
          <p>No existe un camino entre {{ getNodeLabel(selectedStart) }} y {{ getNodeLabel(selectedEnd) }}</p>
        </div>

        <svg class="graph-svg" ref="graphSvgDijkstra" @wheel.prevent="handleWheel" @mousedown.self="startPan" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
          <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">
            <defs>
              <marker id="arrow-dijkstra" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" :fill="arrowColor"></path>
              </marker>
            </defs>

            <g v-for="edge in edgesWithCoords" :key="edge.id">
              <path
                :d="edge.pathData"
                :stroke="edge.isInPath ? '#2563eb' : (edge.color || edgeDefaultColor)"
                :stroke-width="edge.isInPath ? '3' : '2'"
                fill="none"
                :marker-end="'url(#arrow-dijkstra)'"
                :class="{ 'min-path': edge.isInPath }"
              />
              <text
                :x="edge.textX"
                :y="edge.textY"
                text-anchor="middle"
                class="edge-label"
              >
                {{ edge.value }}
              </text>
            </g>

            <g v-for="node in augmentedNodes" :key="node.id"  
              :transform="`translate(${node.x}, ${node.y})`"
              :class="['node-group', node.shape, { 
                'min-path-node': node.isInPath,
                'start-node': node.id === selectedStart,
                'end-node': node.id === selectedEnd
              }]">
              <circle 
                v-if="node.shape === 'circle'" 
                :r="getNodeRadius(node)" 
                :fill="getNodeFill(node)" 
                :stroke="getNodeStroke(node)" 
                :stroke-width="node.isInPath ? '3' : '2'"
              />
              <ellipse 
                v-else 
                :rx="getNodeEllipseRx(node)" 
                ry="25" 
                :fill="getNodeFill(node)" 
                :stroke="getNodeStroke(node)" 
                :stroke-width="node.isInPath ? '3' : '2'"
              />
              <text class="node-label" text-anchor="middle" y="-20">{{ node.label }}</text>
              <text text-anchor="middle" y="5" font-size="12">
                {{ node.distance === Infinity ? '∞' : Math.round(node.distance * 100) / 100 }}
              </text>
            </g>
          </g>
        </svg>
      </main>

      <main v-else class="dijkstra-modal-body">
        <p>El grafo está vacío. Agrega nodos y aristas con valores numéricos.</p>
      </main>

      <footer class="dijkstra-modal-footer">
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
        <input type="file" ref="importFileInputDijkstra" @change="importJSON" accept=".json" style="display: none;" />
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

const selectedStart = ref('');
const selectedEnd = ref('');
const distances = ref(new Map());
const previous = ref(new Map());
const pathNodes = ref(new Set());
const pathEdges = ref(new Set());

const arrowColor = computed(() => props.theme === 'light-theme' ? '#8b7355' : '#c9b4a4');
const edgeDefaultColor = computed(() => props.theme === 'light-theme' ? '#8b7355' : '#c9b4a4');
const minPathNodeFill = computed(() => props.theme === 'light-theme' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(59, 130, 246, 0.25)');

const calculateDijkstra = () => {
  // Limpiar estado previo
  distances.value = new Map();
  previous.value = new Map();
  pathNodes.value = new Set();
  pathEdges.value = new Set();

  // Validaciones iniciales
  if (!selectedStart.value || !selectedEnd.value) {
    return;
  }

  if (selectedStart.value === selectedEnd.value) {
    // Caso especial: inicio y fin son el mismo nodo
    distances.value.set(selectedStart.value, 0);
    pathNodes.value.add(selectedStart.value);
    return;
  }

  // Validar que los nodos existen
  const startExists = props.nodes.some(n => n.id === selectedStart.value);
  const endExists = props.nodes.some(n => n.id === selectedEnd.value);
  
  if (!startExists || !endExists) {
    console.error('Nodo de inicio o fin no existe');
    return;
  }

  // Construir grafo de adyacencia para mejor rendimiento
  const adjacency = new Map();
  props.nodes.forEach(node => {
    adjacency.set(node.id, []);
  });

  props.edges.forEach(edge => {
    const weight = parseFloat(edge.value);
    if (!isNaN(weight) && weight >= 0) {
      if (adjacency.has(edge.from)) {
        adjacency.get(edge.from).push({
          to: edge.to,
          weight: weight,
          edgeId: edge.id
        });
      }
    }
  });

  // Inicializar estructuras
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();
  const unvisited = new Set();

  props.nodes.forEach(node => {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
    unvisited.add(node.id);
  });
  
  dist.set(selectedStart.value, 0);

  // Algoritmo de Dijkstra
  const maxIterations = props.nodes.length;
  let iterations = 0;
  
  while (unvisited.size > 0 && iterations < maxIterations) {
    iterations++;

    // Encontrar el nodo no visitado con menor distancia
    let minDist = Infinity;
    let minNode = null;
    
    for (const nodeId of unvisited) {
      const nodeDist = dist.get(nodeId);
      if (nodeDist < minDist) {
        minDist = nodeDist;
        minNode = nodeId;
      }
    }

    // Si no hay nodos alcanzables, terminar
    if (minNode === null || minDist === Infinity) {
      break;
    }

    // Marcar como visitado
    unvisited.delete(minNode);
    visited.add(minNode);

    // Si llegamos al destino, terminar
    if (minNode === selectedEnd.value) {
      break;
    }

    // Actualizar distancias de vecinos
    const neighbors = adjacency.get(minNode) || [];
    const currentDist = dist.get(minNode);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.to)) {
        const newDist = currentDist + neighbor.weight;
        const neighborDist = dist.get(neighbor.to);
        
        if (newDist < neighborDist) {
          dist.set(neighbor.to, newDist);
          prev.set(neighbor.to, { nodeId: minNode, edgeId: neighbor.edgeId });
        }
      }
    }
  }

  distances.value = dist;
  previous.value = prev;

  // Reconstruir el camino
  const pathSet = new Set();
  const edgeSet = new Set();
  
  const endDist = dist.get(selectedEnd.value);
  
  // Solo reconstruir si existe un camino válido
  if (endDist !== Infinity && endDist !== undefined) {
    let current = selectedEnd.value;
    const visitedInPath = new Set();
    
    // Recorrer hacia atrás desde el destino al origen
    while (current !== null && current !== undefined) {
      // Prevenir ciclos infinitos
      if (visitedInPath.has(current)) {
        console.error('Ciclo detectado en reconstrucción del camino');
        break;
      }
      
      visitedInPath.add(current);
      pathSet.add(current);
      
      // Si llegamos al inicio, terminar
      if (current === selectedStart.value) {
        break;
      }
      
      const prevInfo = prev.get(current);
      
      if (prevInfo && prevInfo.nodeId !== null && prevInfo.nodeId !== undefined) {
        // Agregar la arista al camino
        if (prevInfo.edgeId) {
          edgeSet.add(prevInfo.edgeId);
        }
        current = prevInfo.nodeId;
      } else {
        // No hay camino previo
        break;
      }
      
      // Seguridad adicional
      if (visitedInPath.size > maxIterations) {
        console.error('Excedido límite de nodos en reconstrucción');
        break;
      }
    }
    
    // Verificar que el camino es completo
    if (!pathSet.has(selectedStart.value)) {
      console.warn('Camino incompleto - no se llegó al nodo de inicio');
      pathSet.clear();
      edgeSet.clear();
    }
  }

  pathNodes.value = pathSet;
  pathEdges.value = edgeSet;
};

const minDistance = computed(() => {
  if (!selectedEnd.value || !distances.value.has(selectedEnd.value)) return 0;
  return distances.value.get(selectedEnd.value);
});

const pathExists = computed(() => {
  return selectedStart.value && selectedEnd.value && 
         distances.value.get(selectedEnd.value) !== Infinity;
});

const minPath = computed(() => {
  if (!pathExists.value) return [];
  
  const path = [];
  let current = selectedEnd.value;
  const visited = new Set();
  
  while (current !== null && current !== undefined) {
    // Prevenir bucles infinitos
    if (visited.has(current)) break;
    visited.add(current);
    
    const node = props.nodes.find(n => n.id === current);
    if (node) path.unshift(node.label);
    
    const prevInfo = previous.value.get(current);
    current = prevInfo ? prevInfo.nodeId : null;
    
    // Límite de seguridad
    if (visited.size > props.nodes.length) break;
  }
  
  return path;
});

const augmentedNodes = computed(() => {
  return props.nodes.map(n => {
    const distance = distances.value.get(n.id) ?? Infinity;
    const isInPath = pathNodes.value.has(n.id);
    
    return {
      ...n,
      distance,
      isInPath
    };
  });
});

const getNodeLabel = (nodeId) => {
  const node = props.nodes.find(n => n.id === nodeId);
  return node ? node.label : '';
};

const getNodeFill = (node) => {
  if (node.id === selectedStart.value) {
    return props.theme === 'light-theme' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(74, 222, 128, 0.25)';
  }
  if (node.id === selectedEnd.value) {
    return props.theme === 'light-theme' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(248, 113, 113, 0.25)';
  }
  if (node.isInPath) {
    return minPathNodeFill.value;
  }
  return node.color;
};

const getNodeStroke = (node) => {
  if (node.id === selectedStart.value) return '#22c55e';
  if (node.id === selectedEnd.value) return '#ef4444';
  if (node.isInPath) return '#2563eb';
  return node.borderColor;
};

const nodeMap = computed(() => new Map(augmentedNodes.value.map(node => [node.id, node])));

const edgesWithCoords = computed(() => {
  return props.edges.map(edge => {
    const from = nodeMap.value.get(edge.from);
    const to = nodeMap.value.get(edge.to);
    if (!from || !to) return null;

    let commonProps = { 
      ...edge,
      isInPath: pathEdges.value.has(edge.id)
    };

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
      commonProps.textX = controlPointX;
      commonProps.textY = controlPointY;
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
      commonProps.textX = (from.x + 2 * controlPointX + to.x) / 4;
      commonProps.textY = (from.y + 2 * controlPointY + to.y) / 4;
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
const graphSvgDijkstra = ref(null);
const importFileInputDijkstra = ref(null);

const resetView = () => {
  const graphWidth = maxX.value - minX.value || 800;
  const graphHeight = maxY.value - minY.value || 600;
  const svgWidth = 900;
  const svgHeight = 600;
  zoomLevel.value = Math.min(svgWidth / graphWidth, svgHeight / graphHeight, 1);
  panX.value = (svgWidth - graphWidth * zoomLevel.value) / 2 - minX.value * zoomLevel.value;
  panY.value = (svgHeight - graphHeight * zoomLevel.value) / 2 - minY.value * zoomLevel.value + 50;
};

watch(() => [props.nodes, props.edges], () => {
  resetView();
  calculateDijkstra();
}, { deep: true });

onMounted(resetView);

const handleWheel = (event) => {
  event.preventDefault();
  const delta = event.deltaY < 0 ? 1.1 : 0.9;
  zoomLevel.value = Math.max(0.3, Math.min(3, zoomLevel.value * delta));
};

const startPan = (event) => {
  const svgRect = graphSvgDijkstra.value.getBoundingClientRect();
  lastMousePos.value = {
    x: event.clientX - svgRect.left,
    y: event.clientY - svgRect.top
  };
  isPanning.value = true;
};

const onDrag = (event) => {
  if (isPanning.value) {
    const svgRect = graphSvgDijkstra.value.getBoundingClientRect();
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
  const fileName = prompt("Ingresa el nombre del archivo para guardar:", "grafo_dijkstra_min");
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
  importFileInputDijkstra.value.click();
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
/* Tema Base */
.dijkstra-modal-overlay {
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
  backdrop-filter: blur(4px);
}

.dijkstra-modal-content {
  width: 90%;
  height: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  overflow: hidden;
}

/* Tema Claro */
.light-theme .dijkstra-modal-content  {
  background: linear-gradient(180deg, rgba(253, 246, 236, 0.98) 0%, rgba(248, 238, 226, 0.95) 100%);
  border: 2px solid #c9a887;
}

/* Tema Oscuro */
.dark-theme .dijkstra-modal-content {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.98) 0%, rgba(35, 35, 35, 0.95) 100%);
  border: 2px solid #242a31;
}

/* Header */
.dijkstra-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  flex-shrink: 0;
}

.light-theme .dijkstra-modal-header {
  background: rgba(255, 249, 242, 0.9);
  border-bottom: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .dijkstra-modal-header {
  background: rgba(58, 58, 58, 0.9);
  border-bottom: 1px solid #555;
}

.dijkstra-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.light-theme .dijkstra-modal-header h2 {
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .dijkstra-modal-header h2 {
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
.dijkstra-modal-body {
  flex-grow: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.dijkstra-modal-body p {
  color: #2c2c2c;
}

.dark-theme .dijkstra-modal-body p {
  color: #e0e0e0;
}

.dark-theme .dijkstra-modal-body {
  background-color: #333;
}

/* Node Selection Panel */
.node-selection-panel {
  display: flex;
  gap: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.light-theme .node-selection-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(224, 201, 182, 0.4);
}

.dark-theme .node-selection-panel {
  background: rgba(58, 58, 58, 0.95);
  border: 1px solid #555;
}

.selection-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-group label {
  font-weight: 600;
  font-size: 14px;
}

.light-theme .selection-group label {
  color: #333;
}

.dark-theme .selection-group label {
  color: #e0e0e0;
}

.selection-group select {
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 180px;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.light-theme .selection-group select {
  background-color: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b7355' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  border-color: rgba(224, 201, 182, 0.6);
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dark-theme .selection-group select {
  background-color: #2a2a2a;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23c9b4a4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  border-color: #555;
  color: #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.light-theme .selection-group select:hover {
  border-color: #8b7355;
  box-shadow: 0 4px 8px rgba(139, 115, 85, 0.15);
  transform: translateY(-1px);
}

.dark-theme .selection-group select:hover {
  border-color: #c9b4a4;
  box-shadow: 0 4px 8px rgba(201, 180, 164, 0.15);
  transform: translateY(-1px);
}

.selection-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.light-theme .selection-group select option {
  background: white;
  color: #333;
  padding: 10px;
}

.dark-theme .selection-group select option {
  background: #2a2a2a;
  color: #e0e0e0;
  padding: 10px;
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

/* Node Labels */
.node-label {
  font-weight: bold;
  font-size: 14px;
  pointer-events: none;
}

.light-theme .node-label {
  fill: #000;
}

.dark-theme .node-label {
  fill: #fff;
}

.node-group {
  pointer-events: none;
}

/* Camino Mínimo */
.min-path {
  stroke: #2563eb !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.5));
  animation: pulse-path 2s ease-in-out infinite;
}


@keyframes pulse-arrow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulse-path {
  0%, 100% {
    stroke-opacity: 1;
  }
  50% {
    stroke-opacity: 0.7;
  }
}

.min-path-node circle,
.min-path-node ellipse {
  stroke: #2563eb !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.4));
}

.start-node circle,
.start-node ellipse {
  stroke: #22c55e !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.4));
}

.end-node circle,
.end-node ellipse {
  stroke: #ef4444 !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.4));
}

/* Footer */
.dijkstra-modal-footer {
  padding: 15px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.light-theme .dijkstra-modal-footer {
  background: rgba(255, 249, 242, 0.9);
  border-top: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .dijkstra-modal-footer {
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
  .dijkstra-modal-content {
    width: 95%;
    height: 95%;
  }

  .dijkstra-modal-header h2 {
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

  .node-selection-panel {
    flex-direction: column;
    gap: 10px;
  }

  .selection-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>