import Swal from 'sweetalert2';

/**
 * Detecta si existe un ciclo en un grafo dirigido usando DFS
 * Retorna true si encuentra un ciclo, false si el grafo es acíclico (DAG)
 */
function hasCycle(edges, nodes) {
    const nodeIds = nodes.map(n => n.id);
    
    // Construir lista de adyacencia
    const adjacencyList = new Map();
    nodeIds.forEach(id => adjacencyList.set(id, []));
    
    // Agregar aristas dirigidas a la lista de adyacencia
    edges.forEach(edge => {
        if (edge.directed) {
            const from = edge.from;
            const to = edge.to;
            if (adjacencyList.has(from)) {
                adjacencyList.get(from).push(to);
            }
        }
    });
    
    // Estados para DFS
    const WHITE = 0;  // No visitado
    const GRAY = 1;   // En proceso (en el stack de recursión)
    const BLACK = 2;  // Completado
    
    const colors = new Map();
    nodeIds.forEach(id => colors.set(id, WHITE));
    
    // Función DFS que detecta ciclos
    function dfsVisit(node) {
        colors.set(node, GRAY);
        
        const neighbors = adjacencyList.get(node) || [];
        for (const neighbor of neighbors) {
            const neighborColor = colors.get(neighbor);
            
            if (neighborColor === GRAY) {
                // Encontramos un back edge = ciclo detectado
                return true;
            }
            
            if (neighborColor === WHITE) {
                if (dfsVisit(neighbor)) {
                    return true;
                }
            }
        }
        
        colors.set(node, BLACK);
        return false;
    }
    
    // Explorar todos los nodos (para componentes desconectadas)
    for (const node of nodeIds) {
        if (colors.get(node) === WHITE) {
            if (dfsVisit(node)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Valida la creación de una nueva arista
 * Retorna false si la arista crearía un ciclo en el grafo dirigido
 */
export function validateEdgeCreation(fromId, toId, newEdgeWeight, edges, nodes) {
    // Validar auto-referencia (ciclo de longitud 1)
    if (fromId === toId) {
        return {
            valid: false,
            error: 'SELF_LOOP',
            message: 'No se pueden crear aristas de un nodo a sí mismo'
        };
    }

    // Crear arista temporal
    const tempEdge = {
        id: 'temp_validation_edge',
        from: fromId,
        to: toId,
        value: newEdgeWeight,
        directed: true
    };

    // Verificar si la nueva arista crea un ciclo
    const allEdges = [...edges, tempEdge];
    
    if (hasCycle(allEdges, nodes)) {
        return {
            valid: false,
            error: 'CYCLE_DETECTED',
            message: 'La nueva arista crearía un ciclo en el grafo dirigido.'
        };
    }

    return { valid: true };
}

/**
 * Valida el cambio de peso de una arista existente
 * El cambio de peso no afecta la aciclicidad del grafo
 */
export function validateEdgeWeightChange(edgeId, newWeight, edges, nodes) {
    // El cambio de peso no crea ni elimina ciclos
    // Solo validamos que el peso sea un número válido
    if (isNaN(newWeight) || !isFinite(newWeight)) {
        return {
            valid: false,
            error: 'INVALID_WEIGHT',
            message: 'El peso debe ser un número válido.'
        };
    }

    return { valid: true };
}

/**
 * Valida el cambio de dirección de una arista
 * Invertir la dirección puede crear o eliminar ciclos
 */
export function validateDirectionChange(edge, newDirection, edges, nodes) {
    // Si se está eliminando la dirección, siempre es válido
    if (!newDirection || newDirection === 'none') {
        return { valid: true };
    }

    // Filtrar la arista actual
    const otherEdges = edges.filter(e => e.id !== edge.id);
    
    // Crear una copia de la arista con la nueva dirección
    let modifiedEdge;
    
    if (newDirection === 'backward') {
        // Invertir la dirección
        modifiedEdge = {
            ...edge,
            from: edge.to,
            to: edge.from,
            directed: true
        };
    } else {
        // Mantener o establecer dirección forward
        modifiedEdge = {
            ...edge,
            directed: true
        };
    }

    const allEdges = [...otherEdges, modifiedEdge];

    // Verificar si el cambio crea un ciclo
    if (hasCycle(allEdges, nodes)) {
        return {
            valid: false,
            error: 'CYCLE_DETECTED',
            message: 'El cambio de dirección crearía un ciclo en el grafo dirigido.'
        };
    }

    return { valid: true };
}

/**
 * Valida la conversión de una arista no dirigida a dirigida
 */
export function validateMakeDirected(edge, direction, edges, nodes) {
    if (!direction || direction === 'none') {
        return { valid: true };
    }

    const otherEdges = edges.filter(e => e.id !== edge.id);
    
    let directedEdge = {
        ...edge,
        directed: true
    };

    if (direction === 'backward') {
        directedEdge.from = edge.to;
        directedEdge.to = edge.from;
    }

    const allEdges = [...otherEdges, directedEdge];

    if (hasCycle(allEdges, nodes)) {
        return {
            valid: false,
            error: 'CYCLE_DETECTED',
            message: 'Hacer esta arista dirigida crearía un ciclo en el grafo.'
        };
    }

    return { valid: true };
}

/**
 * Muestra alertas de error de validación
 */
export function showEdgeValidationError(errorType, message, getNodeLabel) {
    let title = '';
    let html = '';
    let icon = 'error';
    const contentClass = 'validation-alert-simple-content'; 

    switch (errorType) {
        case 'SELF_LOOP':
            title = 'Auto-referencia No Permitida';
            html = `
                <div class="${contentClass}">
                    <p><strong>No se permiten aristas de un nodo a sí mismo.</strong></p>
                    <p style="margin-top: 10px;">El algoritmo de Johnson requiere un grafo acíclico dirigido (DAG).</p>
                </div>
            `;
            break;

        case 'CYCLE_DETECTED':
            title = 'Ciclo Detectado';
            html = `
                <div class="${contentClass}">
                    <p><strong>${message}</strong></p>
                    <p style="margin-top: 10px;">
                        El algoritmo de Johnson requiere que el grafo sea <strong>acíclico dirigido (DAG)</strong>.
                    </p>
                    <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                        <em>Un ciclo es un camino que comienza y termina en el mismo nodo siguiendo las direcciones de las aristas.</em>
                    </p>
                </div>
            `;
            break;

        case 'INVALID_WEIGHT':
            title = 'Peso Inválido';
            icon = 'warning';
            html = `
                <div class="${contentClass}">
                    <p><strong>${message}</strong></p>
                    <p style="margin-top: 10px;">Por favor, ingrese un número válido para el peso de la arista.</p>
                </div>
            `;
            break;
            
        default:
            title = 'Error de Validación';
            icon = 'warning';
            html = `
                <div class="${contentClass}">
                    <p>${message || 'Ocurrió un error de validación.'}</p>
                </div>
            `;
            break;
    }

    Swal.fire({
        title,
        html,
        icon,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#007bff',
        width: '500px',
        customClass: {
            popup: 'validation-alert-simple',
            htmlContainer: 'validation-alert-content-simple'
        }
    });
}

/**
 * Verifica si el grafo actual es un DAG (para debugging o validación inicial)
 */
export function isDAG(edges, nodes) {
    return !hasCycle(edges, nodes);
}

/**
 * Encuentra todos los ciclos en el grafo (útil para debugging)
 */
export function findCycles(edges, nodes) {
    const nodeIds = nodes.map(n => n.id);
    const adjacencyList = new Map();
    nodeIds.forEach(id => adjacencyList.set(id, []));
    
    edges.forEach(edge => {
        if (edge.directed) {
            adjacencyList.get(edge.from)?.push(edge.to);
        }
    });
    
    const cycles = [];
    const visited = new Set();
    const recStack = new Set();
    const path = [];
    
    function dfs(node) {
        visited.add(node);
        recStack.add(node);
        path.push(node);
        
        for (const neighbor of adjacencyList.get(node) || []) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            } else if (recStack.has(neighbor)) {
                const cycleStart = path.indexOf(neighbor);
                cycles.push([...path.slice(cycleStart), neighbor]);
            }
        }
        
        path.pop();
        recStack.delete(node);
    }
    
    for (const node of nodeIds) {
        if (!visited.has(node)) {
            dfs(node);
        }
    }
    
    return cycles;
}