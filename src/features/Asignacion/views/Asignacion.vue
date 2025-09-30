<template>
  <Navbar :theme="currentTheme" />
  <div class="graph-editor-container" :class="currentTheme" style="margin-top: 120px;">
    
    <Toolbar
      :canvas-background-style="canvasBackgroundStyle"
      :canvas-background-color="canvasBackgroundColor"
      :is-zoom-enabled="isZoomEnabled"
      @export-image="exportImage"
      @export-pdf="exportPDF"
      @export-json="exportJSON"
      @import-json="triggerImportJSON"
      @set-background="setCanvasBackground"
      @update-background-color="canvasBackgroundColor = $event"
      @toggle-zoom="toggleZoomMode"
    />

    <main class="main-content">
      <Sidebar
        :is-adding-node="isAddingNode"
        :node-shape="nodeShape"
        :is-adding-edge="isAddingEdge"
        :is-eraser-active="isEraserActive"
        :show-matrix="showMatrix"
        @toggle-node-mode="toggleNodeMode"
        @toggle-edge-mode="toggleEdgeMode"
        @toggle-eraser="toggleEraserMode"
        @toggle-matrix="toggleMatrixView"
        @clear-canvas="clearCanvas"
      />

      <GraphCanvas
        ref="graphSvg"
        :nodes="nodes"
        :edges-with-coords="edgesWithCoords"
        :selected-element="selectedElement"
        :edge-start-node="edgeStartNode"
        :current-theme="currentTheme"
        :svg-background-styles="svgBackgroundStyles"
        :zoom-level="zoomLevel"
        :pan-x="panX"
        :pan-y="panY"
        :selected-element-handle-pos="selectedElementHandlePos"
        :flip-button-position="flipButtonPosition"
        :is-editing="isEditing"
        @canvas-click="handleCanvasClick"
        @node-click="handleNodeClick"
        @select-element="selectElement"
        @start-drag="startDrag"
        @on-drag="onDrag"
        @stop-drag="stopDrag"
        @start-handle-drag="startHandleDrag"
        @flip-edge="flipSelectedEdgeDirection"
        @wheel="handleWheel"
        @mousedown="startPan"
      />

      <NodeEditBox
        v-if="selectedElement?.type === 'node' && isEditing"
        :node="selectedElement"
        :zoom-level="zoomLevel"
        :pan-x="panX"
        :pan-y="panY"
        @close="isEditing = false"
      />

      <EdgeEditBox
        v-if="selectedElement?.type === 'edge' && isEditing"
        :edge="selectedElement"
        :position="getEdgeValuePosition()"
        :get-node-label="getNodeLabel"
        @close="isEditing = false"
        @update-direction="updateEdgeDirection"
      />
    </main>

    <MatrixModal
      v-if="showMatrix"
      :nodes="nodes"
      :adjacency-matrix="adjacencyMatrix"
      :current-theme="currentTheme"
      @close="toggleMatrixView"
    />

    <button @click="showSelector = true" class="help-button" title="Algoritmo de Johnson y Asignacion" style="bottom: 85px;">🎨</button>
    <button @click="showHelp = true" class="help-button" title="Ayuda" style="bottom: 25px;">?</button>

    <Help v-if="showHelp" :theme="currentTheme" @close="showHelp = false" />
    <!--
    <AlgorithmSelector 
      v-if="showSelector" 
      :theme="currentTheme" 
      :nodes="nodes" 
      :edges="edges"
      @close="showSelector = false" 
      @update-graph="updateFromJohnson" 
      @clear-graph="clearCanvas" 
    />
    -->

    <input type="file" ref="importFileInput" @change="importJSON" accept=".json" style="display: none;" />
  </div>
</template>

<script>
import { ref } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import Help from '../../../components/Help.vue';

import Toolbar from '../components/Toolbar.vue';
import Sidebar from '../components/Sidebar.vue';
import GraphCanvas from '../components/GraphCanvas.vue';
import NodeEditBox from '../components/NodeEditBox.vue';
import EdgeEditBox from '../components/EdgeEditBox.vue';
import MatrixModal from '../components/MatrixModal.vue';

import { useGraphData } from '../composables/useGraphData';
import { useGraphInteractions } from '../composables/useGraphInteractions';
import { useGraphExport } from '../composables/useGraphExport';
import { useGraphImport } from '../composables/useGraphImport';
import { useZoomPan } from '../composables/useZoomPan';
import { useAdjacencyMatrix } from '../composables/useAdjacencyMatrix';

const currentTheme = localStorage.getItem('data-theme') || 'light-theme';
const showHelp = ref(false);
const showSelector = ref(false);
const importFileInput = ref(null);
const graphSvg = ref(null);

// Graph data
const {
  nodes,
  edges,
  selectedElement,
  isEditing,
  nodeShape,
  edgesWithCoords,
  selectedElementHandlePos,
  flipButtonPosition,
  getNodeLabel,
  selectElement: selectElementData,
  deselectElement,
  removeElement,
  updateFromJohnson
} = useGraphData();

// Graph interactions
const {
  isAddingNode,
  isAddingEdge,
  isEraserActive,
  edgeStartNode,
  draggedNode,
  draggedHandle,
  hasPanned,
  toggleNodeMode,
  toggleEdgeMode,
  toggleEraserMode,
  handleCanvasClick: handleCanvasClickInteraction,
  handleNodeClick: handleNodeClickInteraction,
  selectElement: selectElementInteraction,
  startDrag,
  onDrag: onDragInteraction,
  stopDrag,
  startHandleDrag,
  flipSelectedEdgeDirection,
  updateEdgeDirection
} = useGraphInteractions(nodes, edges, selectedElement, isEditing, nodeShape, edgesWithCoords, deselectElement, selectElementData, removeElement);

// Zoom & Pan
const {
  isZoomEnabled,
  zoomLevel,
  panX,
  panY,
  canvasBackgroundStyle,
  canvasBackgroundColor,
  svgBackgroundStyles,
  toggleZoomMode,
  handleWheel,
  startPan: startPanZoom,
  continuePan,
  stopPan,
  setCanvasBackground
} = useZoomPan(currentTheme, graphSvg, isAddingNode, isAddingEdge, isEraserActive, isEditing, draggedNode, draggedHandle, onDragInteraction);

// Export
const {
  exportImage,
  exportPDF,
  exportJSON
} = useGraphExport(
  nodes, 
  edges, 
  graphSvg, 
  deselectElement, 
  currentTheme, 
  canvasBackgroundStyle, 
  canvasBackgroundColor, 
  zoomLevel, 
  panX, 
  panY
);

// Import
const {
  triggerImportJSON,
  importJSON
} = useGraphImport(
  importFileInput, 
  nodes, 
  edges, 
  deselectElement
);

// Matrix
const { adjacencyMatrix, showMatrix, toggleMatrixView } = useAdjacencyMatrix(nodes, edges);

// Wrapper functions to connect composables
const { addNode, addEdge } = useGraphData();

const handleCanvasClick = (event) => {
  handleCanvasClickInteraction(event, zoomLevel.value, panX.value, panY.value, addNode);
};

const handleNodeClick = (node) => {
  handleNodeClickInteraction(node, addEdge);
};

const selectElement = (element) => {
  selectElementInteraction(element);
};

const onDrag = (event) => {
  onDragInteraction(event, zoomLevel.value, panX.value, panY.value, nodeMap.value, graphSvg);
  continuePan(event, hasPanned);
};

const startPan = (event) => {
  startPanZoom(event, hasPanned);
};

const stopDragAndPan = () => {
  stopDrag();
  stopPan();
};

// Clear canvas
const clearCanvas = () => {
  if (confirm("¿Estás seguro de que quieres borrar todo el grafo? Esta acción no se puede deshacer.")) {
    nodes.value = [];
    edges.value = [];
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
    return { 
      left: `${(edgeWithCoords.textX + panX.value) * zoomLevel.value}px`, 
      top: `${(edgeWithCoords.textY + panY.value) * zoomLevel.value}px` 
    };
  }
  return {};
};

export default {
  name: 'Asignacion',
  components: {
    Navbar,
    Toolbar,
    Sidebar,
    GraphCanvas,    
    NodeEditBox,
    EdgeEditBox,
    MatrixModal,
    Help
  },
  data() {
    return {
      buildNumber: Math.floor(Math.random() * 10000)
    }
  },
}

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

.light-theme .graph-editor-container { background-color: rgba(247, 243, 240, 1); color: #333; }
.dark-theme .graph-editor-container { background-color: rgba(44, 44, 44, 1); color: #e0e0e0; }

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.help-button {
  position: fixed;
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