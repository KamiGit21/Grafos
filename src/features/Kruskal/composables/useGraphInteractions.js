import { ref } from 'vue';
import { getNodeRadius } from '../utils/graphHelpers';
import { validateEdgeCreation, showEdgeValidationError } from '../utils/graphValidations';

export function useGraphInteractions(graphDataComposable) {
    const {
        nodes,
        edges,
        selectedElement,
        isEditing,
        nodeShape,
        nodeMap,
        addNode,
        addEdge,
        selectElement,
        deselectElement,
        removeElement,
        getNodeLabel
    } = graphDataComposable;

    const isAddingNode = ref(false);
    const isAddingEdge = ref(false);
    const isEraserActive = ref(false);
    const edgeStartNode = ref(null);
    const draggedNode = ref(null);
    const draggedHandle = ref(null);
    const hasPanned = ref(false);

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

    const handleCanvasClick = (event, zoomLevel, panX, panY) => {
        if (hasPanned.value) {
            hasPanned.value = false;
            return;
        }
        if (draggedNode.value?.isDragging) return;

        if (isAddingNode.value) {
            const svgRect = event.currentTarget.getBoundingClientRect();
            const svgX = (event.clientX - svgRect.left) / zoomLevel - panX;
            const svgY = (event.clientY - svgRect.top) / zoomLevel - panY;

            const newNode = addNode(svgX, svgY, nodeShape.value);
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

    const handleNodeClick = (node) => {
        if (draggedNode.value?.isDragging) {
            return;
        }
        
        if (isEraserActive.value) {
            removeElement(node);
            return;
        }

        if (isAddingEdge.value) {
            if (!edgeStartNode.value) {
                edgeStartNode.value = node;
            } else {
                const newEdgeWeight = 0; 
                
                const validation = validateEdgeCreation(
                    edgeStartNode.value.id,
                    node.id,
                    newEdgeWeight,
                    edges.value,
                    nodes.value
                );

                if (!validation.valid) {
                    showEdgeValidationError(validation.error, validation.message, getNodeLabel);
                    edgeStartNode.value = null;
                    return;
                }

                const newEdge = addEdge(edgeStartNode.value.id, node.id);
                // Ensure edges are undirected for Kruskal
                newEdge.directed = false;
                edgeStartNode.value = null;
                selectElement(newEdge);
                isEditing.value = true;
            }
        } else {
            selectElement(node);
        }
    };

    const handleElementSelect = (elementFromCoords) => {
        if (isEraserActive.value) {
            removeElement(elementFromCoords);
            return;
        }
        selectElement(elementFromCoords);
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

    const onDrag = (event, zoomLevel, panX, panY, graphSvgRef) => {
        if (draggedNode.value) {
            const dx = (event.clientX - draggedNode.value.clickX) / zoomLevel;
            const dy = (event.clientY - draggedNode.value.clickY) / zoomLevel;
            if (!draggedNode.value.isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                draggedNode.value.isDragging = true;
            }
            if (draggedNode.value.isDragging) {
                draggedNode.value.node.x = draggedNode.value.startX + dx;
                draggedNode.value.node.y = draggedNode.value.startY + dy;
            }
        }

        if (draggedHandle.value && graphSvgRef) {
            const svgRect = graphSvgRef.getBoundingClientRect();
            const svgX = (event.clientX - svgRect.left) / zoomLevel - panX;
            const svgY = (event.clientY - svgRect.top) / zoomLevel - panY;

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
    };

    const stopDrag = () => {
        setTimeout(() => {
            if (draggedNode.value) {
                draggedNode.value.isDragging = false;
                draggedNode.value = null;
            }
        }, 0);
        stopHandleDrag();
    };

    const startHandleDrag = () => {
        draggedHandle.value = selectedElement.value;
    };

    const stopHandleDrag = () => {
        draggedHandle.value = null;
    };

    // In Kruskal edges are undirected; flipping direction is a no-op
    const flipSelectedEdgeDirection = () => {};

    // Direction changes are disabled in Kruskal (edges are undirected)
    const updateEdgeDirection = (event) => {};

    return {
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
        handleCanvasClick,
        handleNodeClick,
        handleElementSelect,
        startDrag,
        onDrag,
        stopDrag,
        startHandleDrag,
        stopHandleDrag,
        flipSelectedEdgeDirection,
        updateEdgeDirection
    };
}