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

    <MatrixModal
      v-if="showMatrix"
      :nodes="classifiedNodes.sources"
      :destinations="classifiedNodes.destinations"
      :assignment-matrix="assignmentMatrix"
      :current-theme="currentTheme"
      :optimization-mode="optimizationMode"
      @close="toggleMatrixView"
    />

    <AlgorithmSelector
      v-if="showAlgorithmSelector"
      :nodes="nodes"
      :edges="edges"
      :optimization-mode="optimizationMode"
      :current-theme="currentTheme"
      @close="showAlgorithmSelector = false"
      @update-graph="updateFromJohnson"
      @clear-graph="clearCanvas"
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
import AlgorithmSelector from '../components/AlgorithmSelector.vue';
import Johnson from '../components/Johnson.vue';
import JohnsonMin from '../components/JohnsonMin.vue';

import { useGraphData } from '../composables/useGraphData';
import { useGraphInteractions } from '../composables/useGraphInteractions';
import { useGraphExport } from '../composables/useGraphExport';
import { useGraphImport } from '../composables/useGraphImport';
import { useZoomPan } from '../composables/useZoomPan';
import { useAdjacencyMatrix } from '../composables/useAdjacencyMatrix';

export default {
    name: 'Johnson',
    components: {
        Navbar,
        Toolbar,
        Sidebar,
        GraphCanvas,
        NodeEditBox,
        EdgeEditBox,
        MatrixModal,
        Help,
        AlgorithmSelector,
    },
    setup() {
        const currentTheme = localStorage.getItem('data-theme') || 'light-theme';
        const showHelp = ref(false);
        const importFileInput = ref(null);
        const graphSvg = ref(null);

        const showAlgorithmSelector = ref(false);
        const optimizationMode = ref('maximize');

        const setOptimizationMode = (mode) => {
            optimizationMode.value = mode;
            showAlgorithmSelector.value = true;
        };

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
            updateFromJohnson,
            nodeMap
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
            handleNodeClick: handleNodeClickRaw,
            handleElementSelect,
            startDrag,
            onDrag: onDragRaw,
            stopDrag,
            startHandleDrag,
            stopHandleDrag,
            flipSelectedEdgeDirection: flipSelectedEdgeDirectionRaw,
            updateEdgeDirection: updateEdgeDirectionRaw
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

        // Adjacency Matrix
        const { 
            showMatrix, 
            toggleMatrixView 
        } = useAdjacencyMatrix(nodes, edges);

        const handleCanvasClick = (event) => {
            handleCanvasClickRaw(event, zoomLevel.value, panX.value, panY.value);
        };

        const handleNodeClick = (node) => {
            handleNodeClickRaw(node, nodes.value);
        };

        const flipSelectedEdgeDirection = () => {
            flipSelectedEdgeDirectionRaw(nodes.value);
        };

        const updateEdgeDirection = (event) => {
            updateEdgeDirectionRaw(event, nodes.value);
        };

        const handleDrag = (event) => {
            const svgElement = graphSvg.value?.$el || null;
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
            // Interacciones
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
            stopHandleDrag,
            flipSelectedEdgeDirection,
            updateEdgeDirection,
            // Zoom & Pan
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
            // Export / Import
            exportImage,
            exportPDF,
            exportJSON,
            triggerImportJSON,
            importJSON,
            // Matrices
            showMatrix,
            toggleMatrixView,
            optimizationMode,
            setOptimizationMode,
            // Funciones misceláneas
            clearCanvas, 
            getEdgeValuePosition, 
            updateFromJohnson,
            showAlgorithmSelector,
            optimizationMode,
            setOptimizationMode,
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