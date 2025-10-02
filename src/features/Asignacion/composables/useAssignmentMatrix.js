import { ref, computed } from 'vue';

export function useAssignmentMatrix(nodes, edges) {
  const showAssignmentMatrix = ref(false);
  const optimizationMode = ref('minimize');

  // Clasificar nodos en orígenes y destinos
  const classifiedNodes = computed(() => {
    const hasOutgoing = new Set();
    const hasIncoming = new Set();

    for (const edge of edges.value) {
      hasOutgoing.add(edge.from);
      hasIncoming.add(edge.to);
    }

    const sources = nodes.value.filter(node => 
      hasOutgoing.has(node.id) && !hasIncoming.has(node.id)
    );

    const destinations = nodes.value.filter(node => 
      hasIncoming.has(node.id) && !hasOutgoing.has(node.id)
    );

    if (sources.length === 0 || destinations.length === 0) {
      return {
        sources: nodes.value,
        destinations: nodes.value,
        isSymmetric: true
      };
    }

    return {
      sources,
      destinations,
      isSymmetric: false
    };
  });

  // Matriz de asignación
  const assignmentMatrix = computed(() => {
    const { sources, destinations } = classifiedNodes.value;
    
    if (sources.length === 0 || destinations.length === 0) return [];
    
    const matrix = Array(sources.length).fill(0).map(() => 
      Array(destinations.length).fill(Infinity)
    );

    const sourceIndexMap = new Map(sources.map((node, i) => [node.id, i]));
    const destIndexMap = new Map(destinations.map((node, i) => [node.id, i]));

    for (const edge of edges.value) {
      const fromIndex = sourceIndexMap.get(edge.from);
      const toIndex = destIndexMap.get(edge.to);
      
      if (fromIndex !== undefined && toIndex !== undefined) {
        const cost = typeof edge.value === 'number' && edge.value !== '' ? edge.value : 0;
        matrix[fromIndex][toIndex] = cost;
      }
    }

    return matrix.map(row => 
      row.map(val => val === Infinity ? 999999 : val)
    );
  });

  // Algoritmo Húngaro completo con todas las iteraciones
  const hungarianAlgorithm = computed(() => {
    const { sources, destinations } = classifiedNodes.value;
    
    if (sources.length === 0 || destinations.length === 0 || assignmentMatrix.value.length === 0) {
      return {
        iterations: [],
        solution: [],
        totalCost: 0,
        assignments: [],
        sources: [],
        destinations: []
      };
    }

    const matrix = JSON.parse(JSON.stringify(assignmentMatrix.value));
    const rows = matrix.length;
    const cols = matrix[0]?.length || 0;

    const iterations = [];
    let iterationCount = 0;

    // Matriz inicial
    iterations.push({
      iteration: iterationCount++,
      step: 'Matriz inicial',
      matrix: JSON.parse(JSON.stringify(matrix)),
      description: `Matriz de costos ${rows}×${cols}`,
      sources: sources.map(n => n.label || n.id),
      destinations: destinations.map(n => n.label || n.id),
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(matrix, rows, cols)
    });

    let workingMatrix = JSON.parse(JSON.stringify(matrix));

    // Conversión a minimización si es necesario
    if (optimizationMode.value === 'maximize') {
      const maxValue = Math.max(...workingMatrix.flat().filter(v => v < 999999));
      if (maxValue > 0) {
        workingMatrix = workingMatrix.map(row => 
          row.map(val => val < 999999 ? maxValue - val : 999999)
        );
        iterations.push({
          iteration: iterationCount++,
          step: 'Conversión a minimización',
          matrix: JSON.parse(JSON.stringify(workingMatrix)),
          description: `Convertir maximización a minimización: max(${maxValue}) - valor`,
          sources: sources.map(n => n.label || n.id),
          destinations: destinations.map(n => n.label || n.id),
          rowsCovered: [],
          colsCovered: [],
          zeros: findZeros(workingMatrix, rows, cols)
        });
      }
    }

    // Hacer la matriz cuadrada, usar 0 
    const size = Math.max(rows, cols);
    const squareMatrix = Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => {
        if (i < rows && j < cols) return workingMatrix[i][j];
        return 0; // Usar 0 
      })
    );

    // Marcar las celdas ficticias para excluirlas del costo
    const fictitiousCells = new Set();
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i >= rows || j >= cols) {
          fictitiousCells.add(`${i},${j}`);
        }
      }
    }

    const sourceLabels = [...sources.map(n => n.label || n.id), ...Array(Math.max(0, size - rows)).fill(0).map((_, i) => `Fict-Orig${i + 1}`)];
    const destLabels = [...destinations.map(n => n.label || n.id), ...Array(Math.max(0, size - cols)).fill(0).map((_, i) => `Fict-Dest${i + 1}`)];

    if (rows !== cols) {
      iterations.push({
        iteration: iterationCount++,
        step: 'Expansión a matriz cuadrada',
        matrix: JSON.parse(JSON.stringify(squareMatrix)),
        description: `Matriz expandida de ${rows}×${cols} a ${size}×${size} con ceros ficticios`,
        sources: sourceLabels,
        destinations: destLabels,
        rowsCovered: [],
        colsCovered: [],
        zeros: findZeros(squareMatrix, size, size),
        fictitiousCells: Array.from(fictitiousCells)
      });
    }

    // Paso 1: Reducción por filas
    for (let i = 0; i < size; i++) {
      // Solo considerar valores reales (no infinitos) para el mínimo
      const realValues = squareMatrix[i].filter(v => v < 999999);
      if (realValues.length > 0) {
        const minRow = Math.min(...realValues);
        if (minRow !== Infinity && minRow > 0) {
          for (let j = 0; j < size; j++) {
            if (squareMatrix[i][j] < 999999) {
              squareMatrix[i][j] -= minRow;
            }
          }
        }
      }
    }
    iterations.push({
      iteration: iterationCount++,
      step: 'Reducción por filas',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: 'Restar el valor mínimo de cada fila',
      sources: sourceLabels,
      destinations: destLabels,
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(squareMatrix, size, size),
      fictitiousCells: Array.from(fictitiousCells)
    });

    // Paso 2: Reducción por columnas
    for (let j = 0; j < size; j++) {
      let minCol = Infinity;
      for (let i = 0; i < size; i++) {
        if (squareMatrix[i][j] < 999999) {
          minCol = Math.min(minCol, squareMatrix[i][j]);
        }
      }
      if (minCol !== Infinity && minCol > 0 && minCol < 999999) {
        for (let i = 0; i < size; i++) {
          if (squareMatrix[i][j] < 999999) {
            squareMatrix[i][j] -= minCol;
          }
        }
      }
    }
    iterations.push({
      iteration: iterationCount++,
      step: 'Reducción por columnas',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: 'Restar el valor mínimo de cada columna',
      sources: sourceLabels,
      destinations: destLabels,
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(squareMatrix, size, size),
      fictitiousCells: Array.from(fictitiousCells)
    });

    // Paso 3: Iteraciones de cobertura y ajuste
    let maxIterations = 20;
    let currentIteration = 0;
    
    while (currentIteration < maxIterations) {
      const { assignments, covered } = findMaximalMatching(squareMatrix, size);
      
      const rowsCovered = covered.rows;
      const colsCovered = covered.cols;
      const numCovered = rowsCovered.filter(x => x).length + colsCovered.filter(x => x).length;

      iterations.push({
        iteration: iterationCount++,
        step: `Búsqueda de asignación (intento ${currentIteration + 1})`,
        matrix: JSON.parse(JSON.stringify(squareMatrix)),
        description: `${assignments.length} asignaciones encontradas, ${numCovered} líneas de cobertura`,
        sources: sourceLabels,
        destinations: destLabels,
        rowsCovered: rowsCovered.map((v, i) => v ? i : -1).filter(x => x >= 0),
        colsCovered: colsCovered.map((v, i) => v ? i : -1).filter(x => x >= 0),
        zeros: findZeros(squareMatrix, size, size),
        assignments: assignments.map(([r, c]) => ({ row: r, col: c })),
        fictitiousCells: Array.from(fictitiousCells)
      });

      if (assignments.length >= size) {
        break;
      }

      // Encontrar el mínimo valor no cubierto (excluyendo infinitos)
      let minUncovered = Infinity;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!rowsCovered[i] && !colsCovered[j] && squareMatrix[i][j] < 999999) {
            minUncovered = Math.min(minUncovered, squareMatrix[i][j]);
          }
        }
      }

      if (minUncovered === Infinity || minUncovered === 0) {
        break;
      }

      // Ajustar la matriz
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (squareMatrix[i][j] < 999999) {
            if (rowsCovered[i] && colsCovered[j]) {
              squareMatrix[i][j] += minUncovered;
            } else if (!rowsCovered[i] && !colsCovered[j]) {
              squareMatrix[i][j] -= minUncovered;
            }
          }
        }
      }

      iterations.push({
        iteration: iterationCount++,
        step: `Ajuste de matriz (iteración ${currentIteration + 1})`,
        matrix: JSON.parse(JSON.stringify(squareMatrix)),
        description: `Restar ${minUncovered} de elementos no cubiertos, sumar ${minUncovered} a intersecciones`,
        sources: sourceLabels,
        destinations: destLabels,
        rowsCovered: rowsCovered.map((v, i) => v ? i : -1).filter(x => x >= 0),
        colsCovered: colsCovered.map((v, i) => v ? i : -1).filter(x => x >= 0),
        zeros: findZeros(squareMatrix, size, size),
        minUncovered,
        fictitiousCells: Array.from(fictitiousCells)
      });

      currentIteration++;
    }

    // Solución final
    const { assignments: finalAssignments } = findMaximalMatching(squareMatrix, size);
    
    // Filtrar asignaciones: excluir ficticias Y excluir las que no existían en la matriz original
    const validAssignments = finalAssignments
      .filter(([row, col]) => {
        // Debe estar dentro de las dimensiones originales
        if (row >= rows || col >= cols) return false;
        // No debe ser una celda ficticia
        if (fictitiousCells.has(`${row},${col}`)) return false;
        // No debe ser una celda con valor infinito en la matriz original
        if (matrix[row][col] >= 999999) return false;
        return true;
      })
      .map(([row, col]) => ({
        from: sources[row].id,
        to: destinations[col].id,
        cost: matrix[row][col],
        fromLabel: sources[row].label || `Origen ${row + 1}`,
        toLabel: destinations[col].label || `Destino ${col + 1}`
      }));

    const totalCost = validAssignments.reduce((sum, a) => sum + a.cost, 0);

    iterations.push({
      iteration: iterationCount++,
      step: 'Solución óptima',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: `Costo total: ${totalCost} (excluyendo asignaciones ficticias)`,
      sources: sourceLabels,
      destinations: destLabels,
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(squareMatrix, size, size),
      assignments: finalAssignments.map(([r, c]) => ({ row: r, col: c })),
      finalAssignments: validAssignments,
      fictitiousCells: Array.from(fictitiousCells)
    });

    return {
      iterations,
      solution: validAssignments,
      totalCost,
      assignments: validAssignments,
      mode: optimizationMode.value,
      sources,
      destinations
    };
  });

  // Encuentra todos los ceros en la matriz
  function findZeros(matrix, rows, cols) {
    const zeros = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j] === 0) {
          zeros.push({ row: i, col: j });
        }
      }
    }
    return zeros;
  }

  // Encuentra el emparejamiento máximo usando búsqueda aumentada
  function findMaximalMatching(matrix, size) {
    const assignments = [];
    const rowAssigned = Array(size).fill(-1);
    const colAssigned = Array(size).fill(-1);

    for (let i = 0; i < size; i++) {
      const visited = Array(size).fill(false);
      tryAssign(i, matrix, size, rowAssigned, colAssigned, visited);
    }

    for (let i = 0; i < size; i++) {
      if (rowAssigned[i] !== -1) {
        assignments.push([i, rowAssigned[i]]);
      }
    }

    const covered = findMinimumCover(matrix, size, assignments);

    return { assignments, covered };
  }

  // Intenta asignar una fila usando caminos aumentados
  function tryAssign(row, matrix, size, rowAssigned, colAssigned, visited) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col] === 0 && !visited[col]) {
        visited[col] = true;

        if (colAssigned[col] === -1 || 
            tryAssign(colAssigned[col], matrix, size, rowAssigned, colAssigned, visited)) {
          rowAssigned[row] = col;
          colAssigned[col] = row;
          return true;
        }
      }
    }
    return false;
  }

  // Encuentra la cobertura mínima de líneas
  function findMinimumCover(matrix, size, assignments) {
    const rowMatched = Array(size).fill(false);
    const colMatched = Array(size).fill(false);

    for (const [row, col] of assignments) {
      rowMatched[row] = true;
      colMatched[col] = true;
    }

    const rowsCovered = Array(size).fill(false);
    const colsCovered = Array(size).fill(false);
    const rowVisited = Array(size).fill(false);

    for (let i = 0; i < size; i++) {
      if (!rowMatched[i]) {
        markConnected(i, matrix, size, assignments, rowVisited, colsCovered);
      }
    }

    for (let i = 0; i < size; i++) {
      if (rowMatched[i] && !rowVisited[i]) {
        rowsCovered[i] = true;
      }
    }

    return { rows: rowsCovered, cols: colsCovered };
  }

  // Marca filas y columnas conectadas por ceros
  function markConnected(row, matrix, size, assignments, rowVisited, colsCovered) {
    if (rowVisited[row]) return;
    rowVisited[row] = true;

    for (let col = 0; col < size; col++) {
      if (matrix[row][col] === 0 && !colsCovered[col]) {
        colsCovered[col] = true;
        
        for (const [r, c] of assignments) {
          if (c === col) {
            markConnected(r, matrix, size, assignments, rowVisited, colsCovered);
          }
        }
      }
    }
  }

  const toggleAssignmentMatrixView = () => {
    showAssignmentMatrix.value = !showAssignmentMatrix.value;
  };

  const setOptimizationMode = (mode) => {
    if (mode === 'minimize' || mode === 'maximize') {
      optimizationMode.value = mode;
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
    classifiedNodes,
    toggleAssignmentMatrixView,
    setOptimizationMode
  };
}