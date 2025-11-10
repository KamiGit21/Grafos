import Swal from 'sweetalert2';

/**
 * Valida la creación de una nueva arista para grafos no dirigidos (Kruskal)
 * - No se permiten self-loops
 * - No se permiten aristas duplicadas entre los mismos dos nodos (sin considerar orden)
 */
export function validateEdgeCreation(fromId, toId, newEdgeWeight, edges, nodes) {
    // No self-loops
    if (fromId === toId) {
        return {
            valid: false,
            error: 'SELF_LOOP',
            message: 'No se permiten aristas de un nodo a sí mismo.'
        };
    }

    // No duplicados (undirected): check both orders
    const duplicate = edges.some(e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId));
    if (duplicate) {
        return {
            valid: false,
            error: 'DUPLICATE_EDGE',
            message: 'Ya existe una arista entre estos nodos.'
        };
    }

    // Weight validation
    if (isNaN(newEdgeWeight) || !isFinite(newEdgeWeight)) {
        return {
            valid: false,
            error: 'INVALID_WEIGHT',
            message: 'El peso debe ser un número válido.'
        };
    }

    return { valid: true };
}

export function validateEdgeWeightChange(edgeId, newWeight, edges, nodes) {
    if (isNaN(newWeight) || !isFinite(newWeight)) {
        return {
            valid: false,
            error: 'INVALID_WEIGHT',
            message: 'El peso debe ser un número válido.'
        };
    }
    return { valid: true };
}

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
                    <p style="margin-top: 10px;">Para Kruskal sólo se usan aristas entre nodos distintos.</p>
                </div>
            `;
            break;
        case 'DUPLICATE_EDGE':
            title = 'Arista Duplicada';
            html = `
                <div class="${contentClass}">
                    <p><strong>Ya existe una arista entre estos nodos.</strong></p>
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
