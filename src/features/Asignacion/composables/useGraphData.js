import { ref, computed } from 'vue';
import { getNodeRadius } from '../utils/graphHelpers';

const generateUniqueId = () => Math.random().toString(36).substring(2, 9); 

export function useGraphData() {
  const nodes = ref([]);
  const edges = ref([]);
  const selectedElement = ref(null);
  const isEditing = ref(false);
  const nodeShape = ref('circle');

  const nodeMap = computed(() => new Map(nodes.value.map(node => [node.id, node])));

  const edgesWithCoords = computed(() => {
    return edges.value.map(edge => {
      const from = nodeMap.value.get(edge.from);
      const to = nodeMap.value.get(edge.to);
      if (!from || !to) return null;

      let commonProps = { ...edge };

      if (from.id === to.id) {
        // Self-loop
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
        // Normal edge
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

  const getNodeLabel = (nodeId) => {
    const node = nodeMap.value.get(nodeId);
    return node ? node.label : '';
  };

  const addNode = (x, y, shape) => {
    const newNode = {
      id: generateUniqueId(),
      x,
      y,
      label: `N-${nodes.value.length + 1}`,
      type: 'node',
      shape,
      color: '#629eff',
      borderColor: '#3b2881'
    };
    nodes.value.push(newNode);
    return newNode;
  };

  const addEdge = (fromId, toId) => {
    const newEdge = {
      id: generateUniqueId(),
      from: fromId,
      to: toId,
      type: 'edge',
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
    return newEdge;
  };

  const removeElement = (element) => {
    if (element.type === 'node') {
      nodes.value = nodes.value.filter((n) => n.id !== element.id);
      edges.value = edges.value.filter((e) => e.from !== element.id && e.to !== element.id);
    } else if (element.type === 'edge') {
      edges.value = edges.value.filter((e) => e.id !== element.id);
    }
    if (selectedElement.value?.id === element.id) {
      deselectElement();
    }
  };

  const selectElement = (elementFromCoords) => {
    const originalElement = (elementFromCoords.type === 'node')
      ? nodes.value.find(n => n.id === elementFromCoords.id)
      : edges.value.find(e => e.id === elementFromCoords.id);

    if (!originalElement) return;

    selectedElement.value = originalElement;
    isEditing.value = true;
  };

  const deselectElement = () => {
    selectedElement.value = null;
    isEditing.value = false;
  };

  const updateFromJohnson = (data) => {
    nodes.value = data.nodes;
    edges.value = data.edges;
    nextNodeId = data.nextNodeId || (Math.max(0, ...nodes.value.map(n => n.id)) + 1) || 1;
    nextEdgeId = data.nextEdgeId || (Math.max(0, ...edges.value.map(e => e.id)) + 1) || 1;
  };

  return {
    nodes,
    edges,
    selectedElement,
    isEditing,
    nodeShape,
    nodeMap,
    edgesWithCoords,
    selectedElementHandlePos,
    flipButtonPosition,
    getNodeLabel,
    addNode,
    addEdge,
    removeElement,
    selectElement,
    deselectElement,
    updateFromJohnson,
    getNextNodeId: () => nextNodeId,
    getNextEdgeId: () => nextEdgeId
  };
}