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

  // Algoritmo Húngaro modificado: PRIMERO COLUMNAS, LUEGO FILAS
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

    // 🔄 MODIFICACIÓN: PRIMERO REDUCCIÓN POR COLUMNAS, LUEGO POR FILAS
    // Paso 1: Reducción por columnas (PRIMERO)
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
      step: 'Reducción por columnas (PRIMERO)',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: 'Restar el valor mínimo de cada columna (nuevo orden: columnas primero)',
      sources: sourceLabels,
      destinations: destLabels,
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(squareMatrix, size, size),
      fictitiousCells: Array.from(fictitiousCells)
    });

    // Paso 2: Reducción por filas (LUEGO)
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
      step: 'Reducción por filas (LUEGO)',
      matrix: JSON.parse(JSON.stringify(squareMatrix)),
      description: 'Restar el valor mínimo de cada fila (después de columnas)',
      sources: sourceLabels,
      destinations: destLabels,
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(squareMatrix, size, size),
      fictitiousCells: Array.from(fictitiousCells)
    });

    // 🔄 NUEVA IMPLEMENTACIÓN: Algoritmo iterativo que garantiza asignación única
    let maxIterations = 50;
    let currentIteration = 0;
    let bestSolution = { assignments: [], totalCost: Infinity };
    let currentMatrix = JSON.parse(JSON.stringify(squareMatrix));
    
    while (currentIteration < maxIterations) {
      // Buscar asignación con el método columnas-primero
      const assignmentResult = findCompleteAssignment(currentMatrix, size);
      
      if (assignmentResult.complete) {
        // Verificar que la asignación sea válida (sin conflictos)
        const validAssignments = validateAssignments(assignmentResult.assignments, rows, cols, fictitiousCells, matrix, sources, destinations);
        
        if (validAssignments.isValid) {
          // Solución válida encontrada
          iterations.push({
            iteration: iterationCount++,
            step: `Solución completa encontrada (iteración ${currentIteration + 1})`,
            matrix: JSON.parse(JSON.stringify(currentMatrix)),
            description: `Asignación completa válida encontrada: ${validAssignments.assignments.length} asignaciones`,
            sources: sourceLabels,
            destinations: destLabels,
            rowsCovered: [],
            colsCovered: [],
            zeros: findZeros(currentMatrix, size, size),
            assignments: assignmentResult.assignments.map(([r, c]) => ({ row: r, col: c })),
            fictitiousCells: Array.from(fictitiousCells),
            finalAssignments: validAssignments.assignments
          });

          bestSolution = {
            assignments: validAssignments.assignments,
            totalCost: validAssignments.totalCost
          };
          break;
        } else {
          // Asignación tiene conflictos, continuar iterando
          iterations.push({
            iteration: iterationCount++,
            step: `Asignación con conflictos (iteración ${currentIteration + 1})`,
            matrix: JSON.parse(JSON.stringify(currentMatrix)),
            description: `Asignación encontrada pero con conflictos. Continuando iteración...`,
            sources: sourceLabels,
            destinations: destLabels,
            rowsCovered: [],
            colsCovered: [],
            zeros: findZeros(currentMatrix, size, size),
            assignments: assignmentResult.assignments.map(([r, c]) => ({ row: r, col: c })),
            fictitiousCells: Array.from(fictitiousCells)
          });
        }
      } else {
        // No se encontró asignación completa en esta iteración
        iterations.push({
          iteration: iterationCount++,
          step: `Búsqueda de asignación (iteración ${currentIteration + 1})`,
          matrix: JSON.parse(JSON.stringify(currentMatrix)),
          description: `No se encontró asignación completa. Ajustando matriz...`,
          sources: sourceLabels,
          destinations: destLabels,
          rowsCovered: [],
          colsCovered: [],
          zeros: findZeros(currentMatrix, size, size),
          assignments: assignmentResult.assignments.map(([r, c]) => ({ row: r, col: c })),
          fictitiousCells: Array.from(fictitiousCells)
        });
      }

      // Si no tenemos solución completa, ajustar la matriz
      const covered = findMinimumCover(currentMatrix, size, assignmentResult.assignments);
      const rowsCovered = covered.rows;
      const colsCovered = covered.cols;

      // Encontrar el mínimo valor no cubierto
      let minUncovered = Infinity;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!rowsCovered[i] && !colsCovered[j] && currentMatrix[i][j] < 999999) {
            minUncovered = Math.min(minUncovered, currentMatrix[i][j]);
          }
        }
      }

      if (minUncovered === Infinity || minUncovered === 0) {
        break;
      }

      // Ajustar la matriz
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (currentMatrix[i][j] < 999999) {
            if (rowsCovered[i] && colsCovered[j]) {
              currentMatrix[i][j] += minUncovered;
            } else if (!rowsCovered[i] && !colsCovered[j]) {
              currentMatrix[i][j] -= minUncovered;
            }
          }
        }
      }

      iterations.push({
        iteration: iterationCount++,
        step: `Ajuste de matriz (iteración ${currentIteration + 1})`,
        matrix: JSON.parse(JSON.stringify(currentMatrix)),
        description: `Restar ${minUncovered} de elementos no cubiertos, sumar ${minUncovered} a intersecciones`,
        sources: sourceLabels,
        destinations: destLabels,
        rowsCovered: rowsCovered.map((v, i) => v ? i : -1).filter(x => x >= 0),
        colsCovered: colsCovered.map((v, i) => v ? i : -1).filter(x => x >= 0),
        zeros: findZeros(currentMatrix, size, size),
        minUncovered,
        fictitiousCells: Array.from(fictitiousCells)
      });

      currentIteration++;
    }

    // Si no se encontró solución completa después de las iteraciones, usar la mejor solución parcial
    let finalAssignments = bestSolution.assignments;
    
    if (finalAssignments.length === 0) {
      // Último intento con asignación directa
      const lastAttempt = findCompleteAssignment(currentMatrix, size);
      finalAssignments = validateAssignments(
        lastAttempt.assignments, 
        rows, 
        cols, 
        fictitiousCells, 
        matrix, 
        sources, 
        destinations
      ).assignments;
    }

    const totalCost = finalAssignments.reduce((sum, a) => sum + a.cost, 0);

    iterations.push({
      iteration: iterationCount++,
      step: 'Solución final',
      matrix: JSON.parse(JSON.stringify(currentMatrix)),
      description: finalAssignments.length === Math.min(rows, cols) 
        ? `Solución óptima encontrada: ${totalCost} de costo total` 
        : `Solución parcial: ${finalAssignments.length} de ${Math.min(rows, cols)} asignaciones - Costo: ${totalCost}`,
      sources: sourceLabels,
      destinations: destLabels,
      rowsCovered: [],
      colsCovered: [],
      zeros: findZeros(currentMatrix, size, size),
      assignments: finalAssignments.map(a => ({ row: sources.findIndex(s => s.id === a.from), col: destinations.findIndex(d => d.id === a.to) })),
      finalAssignments: finalAssignments,
      fictitiousCells: Array.from(fictitiousCells)
    });

    return {
      iterations,
      solution: finalAssignments,
      totalCost,
      assignments: finalAssignments,
      mode: optimizationMode.value,
      sources,
      destinations
    };
  });

  // 🔄 NUEVA FUNCIÓN: Encontrar asignación completa que garantice unicidad
  function findCompleteAssignment(matrix, size) {
    const assignments = [];
    const usedRows = new Set();
    const usedCols = new Set();
    
    // PRIMERO: Buscar por columnas
    for (let col = 0; col < size; col++) {
      if (usedCols.has(col)) continue;
      
      // Encontrar todas las filas con cero en esta columna
      const availableRows = [];
      for (let row = 0; row < size; row++) {
        if (!usedRows.has(row) && matrix[row][col] === 0) {
          availableRows.push(row);
        }
      }
      
      // Si hay exactamente una fila disponible, asignarla
      if (availableRows.length === 1) {
        const row = availableRows[0];
        assignments.push([row, col]);
        usedRows.add(row);
        usedCols.add(col);
      }
    }
    
    // SEGUNDO: Buscar por filas
    for (let row = 0; row < size; row++) {
      if (usedRows.has(row)) continue;
      
      // Encontrar todas las columnas con cero en esta fila
      const availableCols = [];
      for (let col = 0; col < size; col++) {
        if (!usedCols.has(col) && matrix[row][col] === 0) {
          availableCols.push(col);
        }
      }
      
      // Si hay exactamente una columna disponible, asignarla
      if (availableCols.length === 1) {
        const col = availableCols[0];
        assignments.push([row, col]);
        usedRows.add(row);
        usedCols.add(col);
      }
    }
    
    // TERCERO: Para las restantes, usar asignación greedy por columnas
    for (let col = 0; col < size; col++) {
      if (usedCols.has(col)) continue;
      
      for (let row = 0; row < size; row++) {
        if (!usedRows.has(row) && matrix[row][col] === 0) {
          assignments.push([row, col]);
          usedRows.add(row);
          usedCols.add(col);
          break;
        }
      }
    }
    
    return {
      assignments,
      complete: assignments.length === size
    };
  }

  // 🔄 NUEVA FUNCIÓN: Validar que las asignaciones sean únicas
  function validateAssignments(assignments, originalRows, originalCols, fictitiousCells, originalMatrix, sources, destinations) {
    const rowUsage = new Map();
    const colUsage = new Map();
    const validAssignments = [];
    
    // Contar uso de filas y columnas
    for (const [row, col] of assignments) {
      if (!rowUsage.has(row)) rowUsage.set(row, 0);
      if (!colUsage.has(col)) colUsage.set(col, 0);
      
      rowUsage.set(row, rowUsage.get(row) + 1);
      colUsage.set(col, colUsage.get(col) + 1);
    }
    
    // Identificar conflictos
    const conflictingRows = Array.from(rowUsage.entries()).filter(([_, count]) => count > 1).map(([row]) => row);
    const conflictingCols = Array.from(colUsage.entries()).filter(([_, count]) => count > 1).map(([col]) => col);
    
    // Si no hay conflictos, todas las asignaciones son válidas
    if (conflictingRows.length === 0 && conflictingCols.length === 0) {
      for (const [row, col] of assignments) {
        // Filtrar asignaciones ficticias y fuera de rango
        if (row >= originalRows || col >= originalCols) continue;
        if (fictitiousCells.has(`${row},${col}`)) continue;
        if (originalMatrix[row][col] >= 999999) continue;
        
        validAssignments.push({
          from: sources[row].id,
          to: destinations[col].id,
          cost: originalMatrix[row][col],
          fromLabel: sources[row].label || `Origen ${row + 1}`,
          toLabel: destinations[col].label || `Destino ${col + 1}`
        });
      }
      
      return {
        isValid: true,
        assignments: validAssignments,
        totalCost: validAssignments.reduce((sum, a) => sum + a.cost, 0)
      };
    }
    
    // Si hay conflictos, resolverlos seleccionando la mejor asignación para cada conflicto
    const resolvedAssignments = new Set();
    
    // Resolver conflictos de filas
    for (const row of conflictingRows) {
      const rowAssignments = assignments.filter(([r, _]) => r === row);
      // Seleccionar la asignación con menor costo
      const bestAssignment = rowAssignments.reduce((best, [r, col]) => {
        const cost = (r < originalRows && col < originalCols && !fictitiousCells.has(`${r},${col}`)) 
          ? originalMatrix[r][col] 
          : 999999;
        return cost < best.cost ? { row: r, col, cost } : best;
      }, { row: -1, col: -1, cost: Infinity });
      
      if (bestAssignment.row !== -1) {
        resolvedAssignments.add(`${bestAssignment.row},${bestAssignment.col}`);
      }
    }
    
    // Resolver conflictos de columnas
    for (const col of conflictingCols) {
      const colAssignments = assignments.filter(([_, c]) => c === col);
      // Seleccionar la asignación con menor costo
      const bestAssignment = colAssignments.reduce((best, [row, c]) => {
        const assignmentKey = `${row},${c}`;
        // Si ya fue seleccionada, saltar
        if (resolvedAssignments.has(assignmentKey)) return best;
        
        const cost = (row < originalRows && c < originalCols && !fictitiousCells.has(`${row},${c}`)) 
          ? originalMatrix[row][c] 
          : 999999;
        return cost < best.cost ? { row, col: c, cost } : best;
      }, { row: -1, col: -1, cost: Infinity });
      
      if (bestAssignment.row !== -1) {
        resolvedAssignments.add(`${bestAssignment.row},${bestAssignment.col}`);
      }
    }
    
    // Agregar asignaciones no conflictivas
    for (const [row, col] of assignments) {
      const assignmentKey = `${row},${col}`;
      const isConflicting = conflictingRows.includes(row) || conflictingCols.includes(col);
      
      if (!isConflicting && !resolvedAssignments.has(assignmentKey)) {
        resolvedAssignments.add(assignmentKey);
      }
    }
    
    // Convertir a formato final
    for (const key of resolvedAssignments) {
      const [row, col] = key.split(',').map(Number);
      
      if (row >= originalRows || col >= originalCols) continue;
      if (fictitiousCells.has(`${row},${col}`)) continue;
      if (originalMatrix[row][col] >= 999999) continue;
      
      validAssignments.push({
        from: sources[row].id,
        to: destinations[col].id,
        cost: originalMatrix[row][col],
        fromLabel: sources[row].label || `Origen ${row + 1}`,
        toLabel: destinations[col].label || `Destino ${col + 1}`
      });
    }
    
    return {
      isValid: validAssignments.length > 0 && 
               validAssignments.length === new Set(validAssignments.map(a => a.from)).size &&
               validAssignments.length === new Set(validAssignments.map(a => a.to)).size,
      assignments: validAssignments,
      totalCost: validAssignments.reduce((sum, a) => sum + a.cost, 0)
    };
  }

  // 🔄 FUNCIONES AUXILIARES EXISTENTES (mantenidas para compatibilidad)

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