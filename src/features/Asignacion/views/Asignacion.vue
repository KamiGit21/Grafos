<template>
  <Navbar :theme="currentTheme" />
  <div class="graph-editor-container" :class="currentTheme" style="margin-top: 120px;">
    
    <Toolbar
      :canvas-background-style="canvasBackgroundStyle"
      :canvas-background-color="canvasBackgroundColor"
      :is-zoom-enabled="isZoomEnabled"
      :current-optimization-mode="optimizationMode"
      @export-image="exportImage"
      @export-pdf="exportPDF"
      @export-json="exportJSON"
      @import-json="triggerImportJSON"
      @set-background="setCanvasBackground"
      @update-background-color="canvasBackgroundColor = $event"
      @toggle-zoom="toggleZoomMode"
      @set-optimization-mode="setOptimizationMode"
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
        @select-element="handleElementSelect"
        @start-drag="startDrag"
        @on-drag="handleDrag"
        @stop-drag="handleStopDrag"
        @start-handle-drag="startHandleDrag"
        @flip-edge="flipSelectedEdgeDirection"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
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

    <!-- MODIFICACIÓN: MatrixModal ahora muestra la matriz de asignación -->
    <MatrixModal
      v-if="showMatrix"
      :nodes="classifiedNodes.sources"
      :destinations="classifiedNodes.destinations"
      :assignment-matrix="assignmentMatrix"
      :current-theme="currentTheme"
      :optimization-mode="optimizationMode"
      @close="toggleMatrixView"
    />

    <AssignmentMatrix
      v-if="showAssignmentMatrix"
      :nodes="nodes"
      :assignment-matrix="assignmentMatrix"
      :hungarian-result="hungarianAlgorithm"
      :optimization-mode="optimizationMode"
      :current-theme="currentTheme"
      @close="toggleAssignmentMatrixView"
    />

    <button @click="showHelp = true" class="help-button" title="Ayuda" style="bottom: 25px;">?</button>

    <Help v-if="showHelp" :theme="currentTheme" @close="showHelp = false" />

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
import AssignmentMatrix from '../components/AssignmentMatrix.vue';

import { useGraphData } from '../composables/useGraphData';
import { useGraphInteractions } from '../composables/useGraphInteractions';
import { useGraphExport } from '../composables/useGraphExport';
import { useGraphImport } from '../composables/useGraphImport';
import { useZoomPan } from '../composables/useZoomPan';
import { useAdjacencyMatrix } from '../composables/useAdjacencyMatrix';
import { useAssignmentMatrix } from '../composables/useAssignmentMatrix';

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
    AssignmentMatrix,
    Help
  },
  setup() {
    const currentTheme = localStorage.getItem('data-theme') || 'light-theme';
    const showHelp = ref(false);
    const importFileInput = ref(null);
    const graphSvg = ref(null);

    // Graph data - composable principal
    const graphData = useGraphData();
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
      deselectElement,
      updateFromJohnson
    } = graphData;

    // Graph interactions
    const interactions = useGraphInteractions(graphData);
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
      handleCanvasClick: handleCanvasClickRaw,
      handleNodeClick,
      handleElementSelect,
      startDrag,
      onDrag: onDragRaw,
      stopDrag,
      startHandleDrag,
      flipSelectedEdgeDirection,
      updateEdgeDirection
    } = interactions;

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
      startPan,
      continuePan,
      stopPan,
      setCanvasBackground
    } = useZoomPan(
      currentTheme, 
      graphSvg, 
      isAddingNode, 
      isAddingEdge, 
      isEraserActive, 
      isEditing, 
      draggedNode, 
      draggedHandle, 
      onDragRaw
    );

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

    // Assignment Matrix (incluye classifiedNodes y assignmentMatrix)
    const { 
      showAssignmentMatrix,
      assignmentMatrix, 
      hungarianAlgorithm,
      optimizationMode,
      classifiedNodes,
      toggleAssignmentMatrixView,
      setOptimizationMode
    } = useAssignmentMatrix(nodes, edges);

    // Adjacency Matrix - mantenemos para compatibilidad pero no lo usamos para el modal
    const { 
      showMatrix, 
      toggleMatrixView 
    } = useAdjacencyMatrix(nodes, edges);

    // Event handlers
    const handleCanvasClick = (event) => {
      handleCanvasClickRaw(event, zoomLevel.value, panX.value, panY.value);
    };

    const handleDrag = (event) => {
      const svgElement = graphSvg.value?.svgElement || graphSvg.value?.$el?.querySelector('svg') || null;
      onDragRaw(event, zoomLevel.value, panX.value, panY.value, svgElement);
      continuePan(event, hasPanned);
    };

    const handleMouseDown = (event) => {
      startPan(event, hasPanned);
    };

    const handleStopDrag = () => {
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

    return {
      currentTheme,
      showHelp,
      importFileInput,
      graphSvg,
      nodes,
      edges,
      selectedElement,
      isEditing,
      nodeShape,
      edgesWithCoords,
      selectedElementHandlePos,
      flipButtonPosition,
      getNodeLabel,
      isAddingNode,
      isAddingEdge,
      isEraserActive,
      edgeStartNode,
      toggleNodeMode,
      toggleEdgeMode,
      toggleEraserMode,
      handleCanvasClick,
      handleNodeClick,
      handleElementSelect,
      startDrag,
      handleDrag,
      handleStopDrag,
      startHandleDrag,
      flipSelectedEdgeDirection,
      updateEdgeDirection,
      isZoomEnabled,
      zoomLevel,
      panX,
      panY,
      canvasBackgroundStyle,
      canvasBackgroundColor,
      svgBackgroundStyles,
      toggleZoomMode,
      handleWheel,
      handleMouseDown,
      setCanvasBackground,
      exportImage,
      exportPDF,
      exportJSON,
      triggerImportJSON,
      importJSON,
      showMatrix,
      toggleMatrixView,
      showAssignmentMatrix,
      assignmentMatrix,
      hungarianAlgorithm,
      optimizationMode,
      classifiedNodes,
      toggleAssignmentMatrixView,
      setOptimizationMode,
      clearCanvas,
      getEdgeValuePosition,
      updateFromJohnson
    };
  },
  data() {
    return {
      buildNumber: Math.floor(Math.random() * 10000)
    }
  }
}
</script>

<style scoped>

.graph-editor-container {
  width: 90vw;
  max-width: 1600px;
  /* aspect-ratio: 16 / 9; */
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
  margin-bottom: 40px;
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