import { ref, computed } from 'vue';

export function useAdjacencyMatrix(nodes, edges) {
  const showMatrix = ref(false);

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

  const toggleMatrixView = () => {
    showMatrix.value = !showMatrix.value;
  };

  return {
    showMatrix,
    adjacencyMatrix,
    toggleMatrixView
  };
}