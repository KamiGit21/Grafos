<template>
  <Navbar :theme="currentTheme"/>
  <div class="graph-editor-container" :class="currentTheme" style="margin-top: 120px;">
    
    <header class="toolbar-top">
      <div class="header-content">
        <h1>Pizarra de Grafos</h1>
        <nav>
          <button @click="exportImage">Exportar Imagen</button>
          <button @click="exportPDF">Exportar PDF</button>
          <button @click="exportJSON">Exportar JSON</button>
          <button @click="triggerImportJSON">Importar JSON</button>
          <input type="file" ref="importFileInput" @change="importJSON" accept=".json" style="display: none;" />
          <div class="background-selector">
            <button @click="setCanvasBackground('grid')" :class="{ 'active': canvasBackgroundStyle === 'grid' }"
              title="Fondo de Cuadrícula">▦</button>
            <button @click="setCanvasBackground('dots')" :class="{ 'active': canvasBackgroundStyle === 'dots' }"
              title="Fondo de Puntos">⠶</button>
            <button @click="setCanvasBackground('blank')" :class="{ 'active': canvasBackgroundStyle === 'blank' }"
              title="Fondo Blanco">∅</button>
            <label class="color-picker-label" title="Color de Fondo">
              <input type="color" v-model="canvasBackgroundColor" />
            </label>
          </div>
          <button @click="toggleZoomMode" :class="{ 'active': isZoomEnabled }"
            title="Activar/Desactivar Zoom">🔍</button>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <aside class="sidebar-left">
        <div class="tool-group">
          <button @click="toggleNodeMode('circle')" :class="{ 'active': isAddingNode && nodeShape === 'circle' }"
            title="Añadir Nodo Círculo">
            ⚪
          </button>
          <button @click="toggleNodeMode('oval')" :class="{ 'active': isAddingNode && nodeShape === 'oval' }"
            title="Añadir Nodo Óvalo">
            🥚
          </button>
        </div>

        <button @click="toggleEdgeMode" :class="{ 'active': isAddingEdge }" title="Añadir Arista">↔️</button>
        <button @click="toggleEraserMode" :class="{ 'active': isEraserActive }" title="Borrador">🧽</button>
        <button @click="toggleMatrixView" :class="{ 'active': showMatrix }" title="Ver Matriz">📊</button>

        <button @click="clearCanvas" title="Borrar todo">🗑️</button>
      </aside>

      <section class="canvas-area">
        <svg class="graph-svg" :style="svgBackgroundStyles" @click.self="handleCanvasClick" ref="graphSvg"
          @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag" @wheel.prevent="handleWheel"
          @mousedown.self="startPan">
          <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" :fill="currentTheme === 'light-theme' ? '#555' : '#ccc'"></path>
              </marker>
            </defs>

            <g v-for="edge in edgesWithCoords" :key="edge.id">
              <!-- Transparent path for increased click sensitivity -->
              <path :d="edge.pathData" stroke="transparent" stroke-width="10" fill="none"
                style="pointer-events: visibleStroke;" @click.stop="selectElement(edge)" />
              <!-- Visible path for rendering -->
              <path :d="edge.pathData" :stroke="edge.color" :stroke-width="edge.strokeWidth"
                :stroke-dasharray="edge.strokeDasharray" fill="none" :marker-end="edge.directed ? 'url(#arrow)' : null"
                style="pointer-events: none;"
                :class="{ 'selected': selectedElement && selectedElement.id === edge.id }" />
              <text :x="edge.textX" :y="edge.textY" text-anchor="middle" class="edge-label"
                @click.stop="selectElement(edge)">
                {{ edge.value }}
              </text>
            </g>

            <g v-for="node in nodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`"
              @mousedown.stop="startDrag(node, $event)" @click.stop="handleNodeClick(node)"
              :class="['node-group', node.shape, { 'selected': selectedElement && selectedElement.id === node.id || edgeStartNode?.id === node.id }]">
              <circle v-if="node.shape === 'circle'" :r="getNodeRadius(node)" :fill="node.color"
                :stroke="node.borderColor" stroke-width="2" />
              <ellipse v-else :rx="getNodeEllipseRx(node)" ry="25" :fill="node.color" :stroke="node.borderColor"
                stroke-width="2" />
              <text class="node-label">{{ node.label }}</text>
            </g>

            <g v-if="selectedElementHandlePos.visible">
              <circle :cx="selectedElementHandlePos.x" :cy="selectedElementHandlePos.y" r="8"
                class="manipulation-handle" @mousedown.stop="startHandleDrag" />
            </g>

            <g v-if="flipButtonPosition.visible"
              :transform="`translate(${flipButtonPosition.x}, ${flipButtonPosition.y})`"
              @click.stop="flipSelectedEdgeDirection" class="flip-handle">
              <circle r="10" class="flip-handle-bg" />
              <path d="M 0 -4 A 4 4 0 1 1 -4 0 M -4 0 L -7 -3 M -4 0 L -1 -3" class="flip-handle-icon" />
            </g>
          </g>
        </svg>

        <div v-if="selectedElement?.type === 'node' && isEditing" class="edit-box"
          :style="{ left: `${(selectedElement.x + panX) * zoomLevel}px`, top: `${(selectedElement.y + panY) * zoomLevel}px` }"
          @mousedown.stop>
          <input type="text" v-model="selectedElement.label" placeholder="Nombre" @keyup.enter="isEditing = false"
            autofocus />
          <div class="color-pickers">
            <label>Relleno: <input type="color" v-model="selectedElement.color" /></label>
            <label>Borde: <input type="color" v-model="selectedElement.borderColor" /></label>
          </div>
          <button @click="isEditing = false">Guardar</button>
        </div>

        <div v-if="selectedElement?.type === 'edge' && isEditing" class="edit-box" :style="getEdgeValuePosition()"
          @mousedown.stop>
          <label>Valor: <input type="number" step="any" v-model.number="selectedElement.value" placeholder="Valor"
              @keyup.enter="isEditing = false" autofocus /></label>
          <div class="style-pickers">
            <label>Color: <input type="color" v-model="selectedElement.color" /></label>
            <label>Grosor: <input type="number" v-model="selectedElement.strokeWidth" min="1" max="10" /></label>
          </div>
          <label>Estilo:
            <select v-model="selectedElement.strokeDasharray">
              <option value="0">Sólido</option>
              <option value="5,5">Trazos</option>
              <option value="2,2">Punteado</option>
            </select>
          </label>

          <label>Dirección:
            <select @change="updateEdgeDirection($event)" class="direction-select">
              <option value="none" :selected="!selectedElement.directed">No Dirigido</option>
              <option value="forward" :selected="selectedElement.directed">
                {{ getNodeLabel(selectedElement.from) }} → {{ getNodeLabel(selectedElement.to) }}
              </option>
              <option value="backward">
                {{ getNodeLabel(selectedElement.to) }} → {{ getNodeLabel(selectedElement.from) }}
              </option>
            </select>
          </label>
          <button @click="isEditing = false">Guardar</button>
        </div>
      </section>
    </main>

    <div v-if="showMatrix" class="matrix-modal-overlay" @click.self="toggleMatrixView">
      <div :class="['matrix-modal-content', currentTheme]">
        <header class="matrix-modal-header">
          <h2>Matriz de Adyacencia</h2>
          <button @click="toggleMatrixView" class="close-button">×</button>
        </header>
        <main class="matrix-modal-body" :class="currentTheme">
          <table v-if="nodes.length > 0">
            <thead>
              <tr>
                <th></th>
                <th v-for="n in nodes" :key="'h' + n.id">{{ n.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in adjacencyMatrix" :key="'r' + nodes[rowIndex].id">
                <th>{{ nodes[rowIndex].label }}</th>
                <td v-for="(weight, colIndex) in row" :key="'c' + nodes[colIndex].id">
                  {{ weight }}
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>No hay nodos para mostrar en la matriz.</p>
        </main>
      </div>
    </div>

    <!-- AlgorithmSelector button above Help button -->
    <button @click="showSelector = true" class="help-button" title="Algoritmo de Johnson y Asignacion"
      style="bottom: 85px;">🎨</button>
    <button @click="showHelp = true" class="help-button" title="Ayuda" style="bottom: 25px;">?</button>

    <Help v-if="showHelp" :theme="currentTheme" @close="showHelp = false" />
    <AlgorithmSelector v-if="showSelector" :theme="currentTheme" :nodes="nodes" :edges="edges"
      @close="showSelector = false" @update-graph="updateFromJohnson" @clear-graph="clearCanvas" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import jsPDF from "jspdf";
import Help from '../../../components/Help.vue';
import Navbar from '../../../components/Navbar.vue';
import AlgorithmSelector from './AlgorithmSelector.vue';

const nodes = ref([]);
const edges = ref([]);
const selectedElement = ref(null);
const isEditing = ref(false);
const isEraserActive = ref(false);
const showMatrix = ref(false);
const nodeShape = ref("circle");
const currentTheme = ref(localStorage.getItem('data-theme') || 'light-theme');
const showHelp = ref(false);
const showSelector = ref(false);
const canvasBackgroundStyle = ref('grid');
const canvasBackgroundColor = ref(currentTheme.value === 'light-theme' ? '#ffffff' : '#333333');
const isAddingEdge = ref(false);
const edgeStartNode = ref(null);
const isZoomEnabled = ref(false);
const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const hasPanned = ref(false);
const panDrag = ref(null);
const importFileInput = ref(null);
const graphSvg = ref(null);
const lastMousePos = ref({ x: null, y: null });
const draggedNode = ref(null);
const draggedHandle = ref(null);

let nextNodeId = 1;
let nextEdgeId = 1;

const nodeMap = computed(() => new Map(nodes.value.map(node => [node.id, node])));

const edgesWithCoords = computed(() => {
  return edges.value.map(edge => {
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
      if (edge.directed) {
        const dx = p1x - controlPointX;
        const dy = p1y - controlPointY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = (dist - 10) / dist;
        endPointX = controlPointX + dx * ratio;
        endPointY = controlPointY + dy * ratio;
      }

      commonProps.pathData = `M ${p2x} ${p2y} A ${loopRadius} ${loopRadius} 0 1 1 ${endPointX} ${endPointY}`;
      commonProps.controlPointX = controlPointX;
      commonProps.controlPointY = controlPointY;
      commonProps.textX = controlPointX;
      commonProps.textY = controlPointY;
    } else {
      const toNodeRadius = to.shape === 'circle' ? getNodeRadius(to) : 30;
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      const controlPointX = midX + nx * edge.curveOffset;
      const controlPointY = midY + ny * edge.curveOffset;

      let endPointX = to.x;
      let endPointY = to.y;

      if (edge.directed) {
        const cdx = to.x - controlPointX;
        const cdy = to.y - controlPointY;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist > 0) {
          const ratio = (cdist - toNodeRadius - 5) / cdist;
          endPointX = controlPointX + cdx * ratio;
          endPointY = controlPointY + cdy * ratio;
        }
      }

      commonProps.pathData = `M ${from.x} ${from.y} Q ${controlPointX} ${controlPointY} ${endPointX} ${endPointY}`;
      commonProps.controlPointX = controlPointX;
      commonProps.controlPointY = controlPointY;
      commonProps.textX = (from.x + 2 * controlPointX + to.x) / 4;
      commonProps.textY = (from.y + 2 * controlPointY + to.y) / 4;
    }
    return commonProps;
  }).filter(e => e !== null);
});

const selectedElementHandlePos = computed(() => {
  if (selectedElement.value?.type === 'edge') {
    const edgeCoords = edgesWithCoords.value.find(e => e.id === selectedElement.value.id);
    if (edgeCoords) {
      return {
        visible: true,
        x: edgeCoords.controlPointX,
        y: edgeCoords.controlPointY,
      };
    }
  }
  return { visible: false, x: 0, y: 0 };
});

const flipButtonPosition = computed(() => {
  if (selectedElement.value?.type === 'edge' && selectedElement.value.directed && selectedElement.value.from !== selectedElement.value.to) {
    const edgeCoords = edgesWithCoords.value.find(e => e.id === selectedElement.value.id);
    if (edgeCoords) {
      const pathParts = edgeCoords.pathData.split(' ');
      const endPointX = parseFloat(pathParts[pathParts.length - 2]);
      const endPointY = parseFloat(pathParts[pathParts.length - 1]);
      const controlPointX = edgeCoords.controlPointX;
      const controlPointY = edgeCoords.controlPointY;

      const dx = endPointX - controlPointX;
      const dy = endPointY - controlPointY;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len === 0) return { visible: false, x: 0, y: 0 };

      const offsetX = (dx / len) * 20;
      const offsetY = (dy / len) * 20;

      return {
        visible: true,
        x: endPointX + offsetX,
        y: endPointY + offsetY,
      };
    }
  }
  return { visible: false, x: 0, y: 0 };
});

const adjacencyMatrix = computed(() => {
  const matrix = Array(nodes.value.length).fill(0).map(() => Array(nodes.value.length).fill(0));
  const nodeIndexMap = new Map(nodes.value.map((node, i) => [node.id, i]));

  for (const edge of edges.value) {
    const fromIndex = nodeIndexMap.get(edge.from);
    const toIndex = nodeIndexMap.get(edge.to);
    if (fromIndex !== undefined && toIndex !== undefined) {
      const weight = typeof edge.value === 'number' && edge.value !== '' ? edge.value : 0;
      matrix[fromIndex][toIndex] = weight;

      if (!edge.directed) {
        matrix[toIndex][fromIndex] = weight;
      }
    }
  }
  return matrix;
});

const svgBackgroundStyles = computed(() => {
  const styles = {};
  const defaultGridColor = currentTheme.value === 'light-theme' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
  const gridColor = canvasBackgroundStyle.value !== 'blank' ? defaultGridColor : canvasBackgroundColor.value;
  const scaledSizeGrid = 20 * zoomLevel.value;
  const scaledSizeDots = 15 * zoomLevel.value;
  const posX = -panX.value * zoomLevel.value;
  const posY = -panY.value * zoomLevel.value;

  switch (canvasBackgroundStyle.value) {
    case 'grid':
      styles.backgroundImage = `
                linear-gradient(${gridColor} 1px, transparent 1px),
                linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
            `;
      styles.backgroundSize = `${scaledSizeGrid}px ${scaledSizeGrid}px`;
      styles.backgroundPosition = `${posX}px ${posY}px`;
      styles.backgroundColor = canvasBackgroundColor.value;
      break;
    case 'dots':
      styles.backgroundImage = `radial-gradient(${gridColor} 1px, transparent 1px)`;
      styles.backgroundSize = `${scaledSizeDots}px ${scaledSizeDots}px`;
      styles.backgroundPosition = `${posX}px ${posY}px`;
      styles.backgroundColor = canvasBackgroundColor.value;
      break;
    case 'blank':
      styles.backgroundColor = canvasBackgroundColor.value;
      styles.backgroundImage = 'none';
      break;
  }
  return styles;
});

const getNodeLabel = (nodeId) => {
  const node = nodeMap.value.get(nodeId);
  return node ? node.label : '';
};

const flipSelectedEdgeDirection = () => {
  if (selectedElement.value?.type === 'edge' && selectedElement.value.directed) {
    const edge = selectedElement.value;
    [edge.from, edge.to] = [edge.to, edge.from];
  }
};

const updateEdgeDirection = (event) => {
  if (!selectedElement.value || selectedElement.value.type !== 'edge') return;
  const direction = event.target.value;
  const edge = selectedElement.value;
  if (direction === 'none') {
    edge.directed = false;
  } else if (direction === 'forward') {
    edge.directed = true;
  } else if (direction === 'backward') {
    edge.directed = true;
    [edge.from, edge.to] = [edge.to, edge.from];
  }
};

const toggleZoomMode = () => {
  isZoomEnabled.value = !isZoomEnabled.value;
};

const handleWheel = (event) => {
  if (!isZoomEnabled.value) return;
  event.preventDefault();
  const delta = event.deltaY < 0 ? 1.1 : 0.9;
  zoomLevel.value = Math.max(0.3, Math.min(3, zoomLevel.value * delta));
};

const startPan = (event) => {
  if (isAddingNode.value || isAddingEdge.value || isEraserActive.value || isEditing.value) return;
  isPanning.value = true;
  const svgRect = graphSvg.value.getBoundingClientRect();
  lastMousePos.value = {
    x: event.clientX - svgRect.left,
    y: event.clientY - svgRect.top
  };
  panDrag.value = {
    startX: event.clientX,
    startY: event.clientY,
    startPanX: panX.value,
    startPanY: panY.value
  };
  hasPanned.value = false;
};

const deselectElement = () => {
  selectedElement.value = null;
  isEditing.value = false;
  if (!isAddingEdge.value) {
    edgeStartNode.value = null;
  }
};

const handleCanvasClick = (event) => {
  if (hasPanned.value) {
    hasPanned.value = false;
    return;
  }
  if (draggedNode.value?.isDragging) return;

  if (isAddingNode.value) {
    const svgRect = event.currentTarget.getBoundingClientRect();
    const svgX = (event.clientX - svgRect.left) / zoomLevel.value - panX.value;
    const svgY = (event.clientY - svgRect.top) / zoomLevel.value - panY.value;

    const newNode = {
      id: nextNodeId++,
      x: svgX,
      y: svgY,
      label: `N${nextNodeId - 1}`,
      type: "node",
      shape: nodeShape.value,
      color: "#FFD700",
      borderColor: "#000000"
    };
    nodes.value.push(newNode);
    selectElement(newNode);
    return;
  }

  if (isEraserActive.value || isAddingEdge.value) {
    deselectElement();
    edgeStartNode.value = null;
    return;
  }
  if (selectedElement.value) {
    deselectElement();
  }
};

const selectElement = (elementFromCoords) => {
  if (isEraserActive.value) {
    removeElement(elementFromCoords);
    return;
  }

  const originalElement = (elementFromCoords.type === 'node')
    ? nodes.value.find(n => n.id === elementFromCoords.id)
    : edges.value.find(e => e.id === elementFromCoords.id);

  if (!originalElement) return;

  selectedElement.value = originalElement;
  isEditing.value = true; // Habilitar edición para nodos y aristas
};

const handleNodeClick = (node) => {
  if (draggedNode.value?.isDragging) {
    return;
  }
  if (isAddingEdge.value) {
    if (!edgeStartNode.value) {
      edgeStartNode.value = node;
    } else {
      const newEdge = {
        id: nextEdgeId++,
        from: edgeStartNode.value.id,
        to: node.id,
        type: "edge",
        value: '',
        color: '#555555',
        strokeWidth: 2,
        strokeDasharray: '0',
        directed: false,
        loopSize: 50,
        loopAngle: 0,
        curveOffset: 0,
      };
      edges.value.push(newEdge);
      edgeStartNode.value = null;
      selectElement(newEdge); // Select and edit the new edge
      isEditing.value = true;
    }
  } else {
    selectElement(node);
  }
};

const startDrag = (node, event) => {
  if (isEraserActive.value || isEditing.value || isAddingEdge.value || isAddingNode.value || draggedHandle.value) return;

  draggedNode.value = {
    node,
    startX: node.x,
    startY: node.y,
    clickX: event.clientX,
    clickY: event.clientY,
    isDragging: false
  };
};

const onDrag = (event) => {
  if (draggedNode.value) {
    const svgRect = graphSvg.value.getBoundingClientRect();
    const dx = (event.clientX - draggedNode.value.clickX) / zoomLevel.value;
    const dy = (event.clientY - draggedNode.value.clickY) / zoomLevel.value;
    if (!draggedNode.value.isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      draggedNode.value.isDragging = true;
    }
    if (draggedNode.value.isDragging) {
      draggedNode.value.node.x = draggedNode.value.startX + dx;
      draggedNode.value.node.y = draggedNode.value.startY + dy;
    }
  }

  if (draggedHandle.value) {
    const svgRect = graphSvg.value.getBoundingClientRect();
    const svgX = (event.clientX - svgRect.left) / zoomLevel.value - panX.value;
    const svgY = (event.clientY - svgRect.top) / zoomLevel.value - panY.value;

    const edge = draggedHandle.value;
    const node = nodeMap.value.get(edge.from);

    if (edge.from === edge.to) {
      const nodeRadius = getNodeRadius(node);
      const dx = svgX - node.x;
      const dy = svgY - node.y;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 450) % 360;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newLoopRadius = Math.max(10, (dist - nodeRadius));
      edge.loopAngle = angle;
      edge.loopSize = newLoopRadius * 2;
    } else {
      const fromNode = nodeMap.value.get(edge.from);
      const toNode = nodeMap.value.get(edge.to);
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      const vecX = svgX - midX;
      const vecY = svgY - midY;

      edge.curveOffset = vecX * nx + vecY * ny;
    }
  }

  if (isPanning.value && !draggedNode.value && !draggedHandle.value) {
    const svgRect = graphSvg.value.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    if (lastMousePos.value.x !== null && lastMousePos.value.y !== null) {
      const dx = (mouseX - lastMousePos.value.x) / zoomLevel.value;
      const dy = (mouseY - lastMousePos.value.y) / zoomLevel.value;
      panX.value += dx;
      panY.value += dy;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        hasPanned.value = true;
      }
    }

    lastMousePos.value = { x: mouseX, y: mouseY };
  }
};

const stopDrag = () => {
  setTimeout(() => {
    if (draggedNode.value) {
      draggedNode.value.isDragging = false;
      draggedNode.value = null;
    }
  }, 0);
  stopHandleDrag();
  isPanning.value = false;
  panDrag.value = null;
  lastMousePos.value = { x: null, y: null };
};

const startHandleDrag = () => {
  draggedHandle.value = selectedElement.value;
};

const stopHandleDrag = () => {
  draggedHandle.value = null;
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

const removeElement = (element) => {
  if (element.type === "node") {
    nodes.value = nodes.value.filter((n) => n.id !== element.id);
    edges.value = edges.value.filter((e) => e.from !== element.id && e.to !== element.id);
  } else if (element.type === "edge") {
    edges.value = edges.value.filter((e) => e.id !== element.id);
  }
  if (selectedElement.value?.id === element.id) {
    deselectElement();
  }
};

const toggleNodeMode = (shape) => {
  isAddingNode.value = !(isAddingNode.value && nodeShape.value === shape);
  nodeShape.value = shape;
  isAddingEdge.value = false;
  isEraserActive.value = false;
  deselectElement();
};

const toggleEdgeMode = () => {
  isAddingEdge.value = !isAddingEdge.value;
  isAddingNode.value = false;
  isEraserActive.value = false;
  deselectElement();
  if (!isAddingEdge.value) {
    edgeStartNode.value = null;
  }
};

const toggleEraserMode = () => {
  isEraserActive.value = !isEraserActive.value;
  isAddingNode.value = false;
  isAddingEdge.value = false;
  deselectElement();
};

const toggleMatrixView = () => {
  showMatrix.value = !showMatrix.value;
};

const clearCanvas = () => {
  if (confirm("¿Estás seguro de que quieres borrar todo el grafo? Esta acción no se puede deshacer.")) {
    nodes.value = [];
    edges.value = [];
    nextNodeId = 1;
    nextEdgeId = 1;
    deselectElement();
    zoomLevel.value = 1;
    panX.value = 0;
    panY.value = 0;
    isZoomEnabled.value = false;
  }
};

const getEdgeValuePosition = () => {
  if (!selectedElement.value || selectedElement.value.type !== 'edge') return {};
  const edgeWithCoords = edgesWithCoords.value.find(e => e.id === selectedElement.value.id);
  if (edgeWithCoords) {
    return { left: `${(edgeWithCoords.textX + panX.value) * zoomLevel.value}px`, top: `${(edgeWithCoords.textY + panY.value) * zoomLevel.value}px` };
  }
  return {};
};

const setCanvasBackground = (style) => {
  canvasBackgroundStyle.value = style;
};

const getCanvasFromSvg = () => {
  return new Promise((resolve, reject) => {
    const svgElement = graphSvg.value;
    if (!svgElement) {
      reject(new Error("Elemento SVG no encontrado."));
      return;
    }

    const clonedSvg = svgElement.cloneNode(true);

    const svgRect = svgElement.getBoundingClientRect();
    clonedSvg.setAttribute('width', svgRect.width);
    clonedSvg.setAttribute('height', svgRect.height);

    if (!clonedSvg.getAttribute('xmlns')) {
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    const vbX = -panX.value;
    const vbY = -panY.value;
    const vbW = svgRect.width / zoomLevel.value;
    const vbH = svgRect.height / zoomLevel.value;
    clonedSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);

    const g = clonedSvg.querySelector('g');
    if (g) {
      g.removeAttribute('transform');
    }

    const defaultGridColor = currentTheme.valueOf === 'light-theme' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
    const gridColor = canvasBackgroundStyle.value !== 'blank' ? defaultGridColor : canvasBackgroundColor.value;
    let backgroundStyle = '';

    switch (canvasBackgroundStyle.value) {
      case 'grid':
        backgroundStyle = `
          <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${canvasBackgroundColor.value}" />
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${gridColor}" stroke-width="1"/>
            </pattern>
          </defs>
          <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="url(#grid)" />
        `;
        break;
      case 'dots':
        backgroundStyle = `
          <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${canvasBackgroundColor.value}" />
          <defs>
            <pattern id="dots" width="15" height="15" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="${gridColor}"/>
            </pattern>
          </defs>
          <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="url(#dots)" />
        `;
        break;
      case 'blank':
        backgroundStyle = `
          <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${canvasBackgroundColor.value}" />
        `;
        break;
    }

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(new XMLSerializer().serializeToString(clonedSvg), 'image/svg+xml');
    const defs = svgDoc.querySelector('defs') || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const backgroundElement = parser.parseFromString(backgroundStyle, 'image/svg+xml').documentElement;
    while (backgroundElement.childNodes.length > 0) {
      const node = backgroundElement.childNodes[0];
      if (node.tagName === 'defs') {
        while (node.childNodes.length > 0) {
          defs.appendChild(node.childNodes[0]);
        }
      } else {
        clonedSvg.insertBefore(node, clonedSvg.firstChild);
      }
    }
    if (!svgDoc.querySelector('defs')) {
      clonedSvg.insertBefore(defs, clonedSvg.firstChild);
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

      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      console.error("Error al cargar el SVG como imagen.", err);
      reject(new Error("No se pudo cargar el SVG como imagen."));
    };

    img.src = url;
  });
};

const exportImage = async () => {
  const fileName = prompt("Ingresa el nombre para la imagen:", "grafo_exportado");
  if (!fileName || fileName.trim() === "") return;

  deselectElement();
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const canvas = await getCanvasFromSvg();
    const link = document.createElement('a');
    link.download = `${fileName.trim()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error("Error al exportar imagen:", error);
    alert("Ocurrió un error al generar la imagen. Asegúrate de que el lienzo contenga elementos visibles.");
  }
};

const exportPDF = async () => {
  const fileName = prompt("Ingresa el nombre para el PDF:", "grafo_exportado");
  if (!fileName || fileName.trim() === "") return;

  deselectElement();
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const canvas = await getCanvasFromSvg();
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${fileName.trim()}.pdf`);
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    alert("Ocurrió un error al generar el PDF. Asegúrate de que el lienzo contenga elementos visibles.");
  }
};

const exportJSON = () => {
  const fileName = prompt("Ingresa el nombre del archivo para guardar:", "grafo");
  if (!fileName) return;

  const data = {
    nodes: nodes.value,
    edges: edges.value,
    nextNodeId,
    nextEdgeId,
    currentTheme: currentTheme.value, // Usar .value
    canvasBackgroundStyle: canvasBackgroundStyle.value,
    canvasBackgroundColor: canvasBackgroundColor.value,
    zoomLevel: zoomLevel.value,
    panX: panX.value,
    panY: panY.value
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
  importFileInput.value.click();
};

const importJSON = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      nodes.value = data.nodes || [];
      edges.value = (data.edges || []).map(edge => ({
        ...edge,
        curveOffset: edge.curveOffset || 0,
      }));
      nextNodeId = data.nextNodeId || (Math.max(0, ...nodes.value.map(n => n.id)) + 1) || 1;
      nextEdgeId = data.nextEdgeId || (Math.max(0, ...edges.value.map(e => e.id)) + 1) || 1;
      currentTheme.value = data.currentTheme || 'light-theme';
      canvasBackgroundStyle.value = data.canvasBackgroundStyle || 'grid';
      canvasBackgroundColor.value = data.canvasBackgroundColor || (currentTheme.value === 'light-theme' ? '#ffffff' : '#333333');
      zoomLevel.value = data.zoomLevel || 1;
      panX.value = data.panX || 0;
      panY.value = data.panY || 0;
      isZoomEnabled.value = false;
      deselectElement();
      alert("Grafo importado exitosamente.");
    } catch (error) {
      console.error("Error al importar el JSON:", error);
      alert("Error al importar el archivo JSON. Asegúrate de que sea un formato válido.");
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

const updateFromJohnson = (data) => {
  nodes.value = data.nodes;
  edges.value = data.edges;
  nextNodeId = data.nextNodeId || (Math.max(0, ...nodes.value.map(n => n.id)) + 1) || 1;
  nextEdgeId = data.nextEdgeId || (Math.max(0, ...edges.value.map(e => e.id)) + 1) || 1;
  // No actualizamos theme, background, etc., a menos que se incluya en data
};
</script>

<style scoped>
.graph-editor-container {
  width: 90vw;
  max-width: 1600px;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  font-family: 'Oswald', sans-serif;
  transition: background-color 0.3s;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  margin-left: auto;
  margin-right: auto;
}

.light-theme .graph-editor-container{ background-color: rgba(247, 243, 240, 1); color: #333; }
.light-theme .sidebar-left { background-color: rgba(253, 246, 236, 0.85); border-right-color: #e0c9b6; }
.light-theme .sidebar-left button { border-color: #e0c9b6; background-color: #fff9f2; }
.light-theme .sidebar-left button:hover { background-color: #f3e8dd; }
.light-theme .sidebar-left button.active { background-color: #e0c9b6; border-color: #c9b4a4; }
.light-theme .canvas-area { background-color: transparent; }
.light-theme .graph-svg { border-color: #dcdcdc; }
.light-theme .node-label, .light-theme .edge-label { fill: #333; }
.light-theme .manipulation-handle { fill: rgba(0, 120, 255, 0.7); stroke: #fff; }
.light-theme .flip-handle-bg { fill: #f0f0f0; stroke: #888; }
.light-theme .flip-handle-icon { stroke: #333; }
.light-theme .background-selector { border-color: #e0c9b6; }
.light-theme .background-selector button.active { background-color: #e0c9b6; }
.light-theme .color-picker-label input[type="color"] { border: 1px solid #e0c9b6; }
.light-theme .close-button { color: #888; }
.light-theme .close-button:hover { color: #000; }
.light-theme .edit-box { background-color: rgba(255, 255, 255, 0.95); border-color: #ccc; }
.light-theme .edit-box input, .light-theme .edit-box select { border-color: #ccc; }
.light-theme .edit-box button { background-color: #e9e9e9; }
.light-theme .edit-box button:hover { background-color: #dcdcdc; }

.dark-theme .graph-editor-container{ background-color: rgba(44, 44, 44, 1); color: #e0e0e0; }
.dark-theme .sidebar-left { background-color: rgba(60, 60, 60, 0.85); border-right-color: #555; }
.dark-theme .sidebar-left button { border-color: #555; background-color: #444; }
.dark-theme .sidebar-left button:hover { background-color: #555; }
.dark-theme .sidebar-left button.active { background-color: #555; border-color: #666; }
.dark-theme .canvas-area { background-color: transparent; }
.dark-theme .graph-svg { border-color: #555555; }
.dark-theme .node-label, .dark-theme .edge-label { fill: #e0e0e0; }
.dark-theme .manipulation-handle { fill: rgba(30, 144, 255, 0.7); stroke: #333; }
.dark-theme .flip-handle-bg { fill: #444; stroke: #aaa; }
.dark-theme .flip-handle-icon { stroke: #ddd; }
.dark-theme .background-selector { border-color: #555; }
.dark-theme .background-selector button.active { background-color: #555; }
.dark-theme .color-picker-label input[type="color"] { border: 1px solid #666; }
.dark-theme .close-button { color: #bbb; }
.dark-theme .close-button:hover { color: #fff; }
.dark-theme .edit-box { background-color: rgba(50, 50, 50, 0.95); border-color: #666; color: #e0e0e0; }
.dark-theme .edit-box label { color: #e0e0e0; }
.dark-theme .edit-box input, .dark-theme .edit-box select { border-color: #666; background-color: #444; color: #e0e0e0; }
.dark-theme .edit-box button { background-color: #555; color: #e0e0e0; }
.dark-theme .edit-box button:hover { background-color: #666; }

.toolbar-top { display: flex; justify-content: center; align-items: center; padding: 10px 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); flex-direction: column; gap: 10px; flex-shrink: 0; }
.toolbar-top h1 { margin: 0 0 15px 0; font-size: 1.8rem; font-weight: bold; text-align: center; }
.toolbar-top nav { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 10px; }
.toolbar-top nav button { padding: 8px 12px; border-radius: 5px; cursor: pointer; transition: background-color 0.2s, transform 0.2s; }
.toolbar-top nav .background-selector { display: flex; gap: 8px; align-items: center; padding: 5px; border: 1px solid; border-radius: 5px; }
.toolbar-top nav .color-picker-label { display: flex; align-items: center; }
.toolbar-top nav .color-picker-label input[type="color"] { width: 30px; height: 30px; padding: 0; cursor: pointer; }
.main-content { display: flex; flex: 1; overflow: hidden; }
.sidebar-left { width: 60px; padding: 15px 0; display: flex; flex-direction: column; align-items: center; gap: 15px; flex-shrink: 0; }
.sidebar-left button { width: 45px; height: 45px; border-radius: 8px; font-size: 1.5rem; cursor: pointer; transition: transform 0.2s, background-color 0.2s; display: flex; justify-content: center; align-items: center; }
.sidebar-left button:hover { transform: translateY(-2px); }
.canvas-area { flex: 1; position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center; padding: 20px; }
.graph-svg { width: 100%; height: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; border-width: 1px; border-style: solid; user-select: none; }
.node-group { cursor: grab; transition: filter 0.2s; }
.node-group:hover { filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5)); }

.node-label {
  text-anchor: middle;
  dominant-baseline: central;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none; 
  user-select: none; 
}

.edit-box {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
.edit-box label, .edit-box .color-pickers, .edit-box .style-pickers {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.edit-box input, .edit-box select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid;
}
.edit-box input[type="color"] {
  padding: 0;
  width: 30px;
  height: 30px;
  border: none;
}
.edit-box button {
  align-self: flex-end;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  padding: 0 5px;
}

.matrix-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.matrix-modal-content {
  max-width: 80%;
  max-height: 80%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.matrix-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid;
  flex-shrink: 0;
}

.matrix-modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.matrix-modal-body {
  padding: 20px;
  overflow: auto; 
}

.matrix-modal-body table {
  border-collapse: collapse;
  width: 100%;
}

.matrix-modal-body th, .matrix-modal-body td {
  border: 1px solid;
  padding: 8px;
  text-align: center;
  min-width: 40px;
}

.light-theme .matrix-modal-content { background-color: #ffffff; color: #333; }
.light-theme .matrix-modal-header { border-bottom-color: #ddd; }
.light-theme .matrix-modal-body th { background-color: #f2f2f2; }
.light-theme .matrix-modal-body th, .light-theme .matrix-modal-body td { border-color: #ddd; }

.dark-theme .matrix-modal-content { background-color: #3a3a3a; color: #e0e0e0; }
.dark-theme .matrix-modal-header { border-bottom-color: #555; }
.dark-theme .matrix-modal-body th { background-color: #555; }
.dark-theme .matrix-modal-body th, .dark-theme .matrix-modal-body td { border-color: #666; }

.help-button {
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #c59cf8;
  color: white;
  border: none;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
}

.help-button:hover {
  transform: scale(1.1);
  background-color: #0056b3;
}
</style>