import { ref, computed } from 'vue';

export function useAssignmentMatrix(nodes, edges) {
  const showAssignmentMatrix = ref(false);
  const optimizationMode = ref('minimize'); // 'minimize' o 'maximize'

  // Matriz de asignación (costos de origen a destino)
  const assignmentMatrix = computed(() => {
    if (nodes.value.length === 0) return [];
    
    const matrix = Array(nodes.value.length).fill(0).map(() => 
      Array(nodes.value.length).fill(0)
    );
    const nodeIndexMap = new Map(nodes.value.map((node, i) => [node.id, i]));

    for (const edge of edges.value) {
      const fromIndex = nodeIndexMap.get(edge.from);
      const toIndex = nodeIndexMap.get(edge.to);
      if (fromIndex !== undefined && toIndex !== undefined) {
        const cost = typeof edge.value === 'number' && edge.value !== '' ? edge.value : 0;
        matrix[fromIndex][toIndex] = cost;
      }
    }
    return matrix;
  });

  // Algoritmo Húngaro
  const hungarianAlgorithm = computed(() => {
    if (assignmentMatrix.value.length === 0) {
      return {
        iterations: [],
        solution: [],
        totalCost: 0,
        assignments: []
      };
    }

    const matrix = JSON.parse(JSON.stringify(assignmentMatrix.value));
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;

    if (rows === 0 || cols === 0) {
      return {
        iterations: [],
        solution: [],
        totalCost: 0,
        assignments: []
      };
    }

    const iterations = [];
    let workingMatrix = JSON.parse(JSON.stringify(matrix));

    // Si es maximización, convertir a minimización
    if (optimizationMode.value === 'maximize') {
      const maxValue = Math.max(...workingMatrix.flat().filter(v => v > 0));
      if (maxValue > 0) {
        workingMatrix = workingMatrix.map(row => 
          row.map(val => val > 0 ? maxValue - val : 0)
        );
        iterations.push({
          step: 'Conversión a minimización',
          matrix: JSON.parse(JSON.stringify(workingMatrix)),
          description: `Convertir maximización a minimización: max(${maxValue}) - valor`
        });
      }
    }

    // Hacer la matriz cuadrada si no lo es
    const size = Math.max(rows, cols);
    const squareMatrix = Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => {
        if (i < rows && j < cols) return workingMatrix[i][j];
        return 999999; // Valor alto para evitar asignaciones ficticias
      })
    );

    if (rows !== cols) {
      iterations.push({
        step: 'Matriz cuadrada',
        matrix: JSON.parse(JSON.stringify(squareMatrix)),
        description: `Matriz expandida de ${rows}×${cols} a ${size}×${size}`
      });
    }

    // Paso 1: Restar el mínimo de cada fila
    for (let i = 0; i < size; i++) {
      const minRow = Math.min(...squareMatrix[i]);
      if (minRow !== Infinity && minRow > 0) {
        for (let j = 0; j < size; j++) {
          squareMatrix[i][j] -= minRow;
        }
      }
    }
    iterations.push({
      step: 'Reducción por filas',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: 'Restar el valor mínimo de cada fila'
    });

    // Paso 2: Restar el mínimo de cada columna
    for (let j = 0; j < size; j++) {
      let minCol = Infinity;
      for (let i = 0; i < size; i++) {
        minCol = Math.min(minCol, squareMatrix[i][j]);
      }
      if (minCol !== Infinity && minCol > 0) {
        for (let i = 0; i < size; i++) {
          squareMatrix[i][j] -= minCol;
        }
      }
    }
    iterations.push({
      step: 'Reducción por columnas',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: 'Restar el valor mínimo de cada columna'
    });

    // Paso 3: Encontrar asignación óptima
    const solution = findOptimalAssignment(squareMatrix, size, rows, cols);
    
    // Filtrar asignaciones ficticias (cuando se expandió la matriz)
    const validAssignments = solution
      .filter(([row, col]) => row < rows && col < cols)
      .map(([row, col]) => ({
        from: nodes.value[row].id,
        to: nodes.value[col].id,
        cost: matrix[row][col],
        fromLabel: nodes.value[row].label || `Nodo ${row + 1}`,
        toLabel: nodes.value[col].label || `Nodo ${col + 1}`
      }));

    const totalCost = validAssignments.reduce((sum, a) => sum + a.cost, 0);

    return {
      iterations,
      solution: validAssignments,
      totalCost,
      assignments: validAssignments,
      mode: optimizationMode.value
    };
  });

  // Función para encontrar la asignación óptima
  function findOptimalAssignment(matrix, size, originalRows, originalCols) {
    const n = Math.min(originalRows, originalCols);
    
    // Intentar asignación greedy con ceros
    const assignments = [];
    const rowCovered = Array(size).fill(false);
    const colCovered = Array(size).fill(false);

    // Primera pasada: asignar ceros únicos
    for (let i = 0; i < n; i++) {
      let zeroCount = 0;
      let zeroCol = -1;
      
      for (let j = 0; j < size; j++) {
        if (matrix[i][j] === 0 && !colCovered[j]) {
          zeroCount++;
          zeroCol = j;
        }
      }
      
      if (zeroCount === 1) {
        assignments.push([i, zeroCol]);
        rowCovered[i] = true;
        colCovered[zeroCol] = true;
      }
    }

    // Segunda pasada: asignar ceros restantes
    for (let i = 0; i < n; i++) {
      if (!rowCovered[i]) {
        for (let j = 0; j < size; j++) {
          if (matrix[i][j] === 0 && !colCovered[j]) {
            assignments.push([i, j]);
            rowCovered[i] = true;
            colCovered[j] = true;
            break;
          }
        }
      }
    }

    // Si no se completaron todas las asignaciones, usar método alternativo
    if (assignments.length < n) {
      return findMinimalAssignmentBacktrack(matrix, n, size);
    }

    return assignments;
  }

  // Búsqueda por backtracking para casos complejos
  function findMinimalAssignmentBacktrack(matrix, n, size) {
    const assignments = [];
    const usedCols = Array(size).fill(false);

    function backtrack(row) {
      if (row === n) {
        return true;
      }

      let minCost = Infinity;
      let bestCol = -1;

      for (let col = 0; col < size; col++) {
        if (!usedCols[col] && matrix[row][col] < minCost) {
          minCost = matrix[row][col];
          bestCol = col;
        }
      }

      if (bestCol !== -1) {
        usedCols[bestCol] = true;
        assignments.push([row, bestCol]);
        
        if (backtrack(row + 1)) {
          return true;
        }
        
        // Si falla, intentar con la siguiente mejor opción
        usedCols[bestCol] = false;
        assignments.pop();
      }

      return false;
    }

    backtrack(0);
    return assignments;
  }

  const toggleAssignmentMatrixView = () => {
    showAssignmentMatrix.value = !showAssignmentMatrix.value;
  };

  const setOptimizationMode = (mode) => {
    if (mode === 'minimize' || mode === 'maximize') {
      optimizationMode.value = mode;
      // Abrir automáticamente la matriz cuando se selecciona un modo
      if (!showAssignmentMatrix.value) {
        showAssignmentMatrix.value = true;
      }
    }
  };

  return {
    showAssignmentMatrix,
    assignmentMatrix,
    hungarianAlgorithm,
    optimizationMode,
    toggleAssignmentMatrixView,
    setOptimizationMode
  };
}