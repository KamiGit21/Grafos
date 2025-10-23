import Swal from 'sweetalert2';

export function validateEdgeCreation(fromId, toId, edges, getNodeLabel) {
  // Validación 1: No permitir self-loops
  if (fromId === toId) {
    return {
      valid: false,
      error: 'SELF_LOOP',
      message: 'No se pueden crear aristas de un nodo a sí mismo'
    };
  }

  // Obtener el tipo de cada nodo basado en las aristas existentes
  const nodeTypes = getNodeTypes(edges);
  
  const fromType = nodeTypes.get(fromId);
  const toType = nodeTypes.get(toId);

  // Validación 2: Verificar si el nodo origen ya es receptor
  if (fromType === 'RECEIVER') {
    const fromLabel = getNodeLabel(fromId);
    return {
      valid: false,
      error: 'SOURCE_IS_RECEIVER',
      message: `El nodo ${fromLabel} ya es receptor y no puede enviar aristas`
    };
  }

  // Validación 3: Verificar si el nodo destino ya es emisor
  if (toType === 'SENDER') {
    const toLabel = getNodeLabel(toId);
    return {
      valid: false,
      error: 'TARGET_IS_SENDER',
      message: `El nodo ${toLabel} ya es emisor y no puede recibir aristas`
    };
  }

  return { valid: true };
}

function getNodeTypes(edges) {
  const nodeTypes = new Map();

  for (const edge of edges) {
    // El nodo 'from' es siempre SENDER
    if (!nodeTypes.has(edge.from)) {
      nodeTypes.set(edge.from, 'SENDER');
    }

    // El nodo 'to' es siempre RECEIVER
    if (!nodeTypes.has(edge.to)) {
      nodeTypes.set(edge.to, 'RECEIVER');
    }
  }

  return nodeTypes;
}

export function showEdgeValidationError(errorType, message, getNodeLabel) {
  let title = '';
  let html = '';
  let icon = 'error';
  
  // Clase para el contenido, si necesitas estilizar el texto internamente
  const contentClass = 'validation-alert-simple-content'; 

  switch (errorType) {
    case 'SELF_LOOP':
      title = 'Auto-referencia No Permitida';
      html = `
        <div class="${contentClass}">
          <p><strong>Motivo:</strong> No se permiten aristas de un nodo a sí mismo.</p>
          <p>En este grafo, los nodos tienen un rol único: o son <strong>emisores</strong> (envían) o <strong>receptores</strong> (reciben). Un nodo no puede ser ambos.</p>
        </div>
      `;
      break;

    case 'SOURCE_IS_RECEIVER':
      title = 'Fuente No Válida';
      html = `
        <div class="${contentClass}">
          <p><strong>${message}</strong></p>
          <p>El nodo seleccionado como <strong>fuente</strong> ya está <strong>recibiendo</strong> aristas, lo que lo define como un <strong>receptor</strong>.</p>
          <p>Un nodo receptor no puede iniciar una nueva arista (ser emisor).</p>
          <div class="alert-suggestion-box">
            <strong>Solución:</strong> Elimina primero las aristas que llegan a este nodo para que pueda convertirse en emisor.
          </div>
        </div>
      `;
      break;

    case 'TARGET_IS_SENDER':
      title = 'Destino No Válido';
      html = `
        <div class="${contentClass}">
          <p><strong>${message}</strong></p>
          <p>El nodo seleccionado como <strong>destino</strong> ya está <strong>enviando</strong> aristas, lo que lo define como un <strong>emisor</strong>.</p>
          <p>Un nodo emisor no puede recibir una nueva arista (ser receptor).</p>
          <div class="alert-suggestion-box">
            <strong>Solución:</strong> Elimina primero las aristas que salen de este nodo para que pueda convertirse en receptor.
          </div>
        </div>
      `;
      break;
      
    default:
        title = '⚠️ Error de Validación';
        icon = 'warning';
        html = `<div class="${contentClass}"><p>Ocurrió un error inesperado de validación: ${errorType}.</p></div>`;
        break;
  }

  // SweetAlert2
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


export function validateDirectionChange(edge, newDirection, edges, getNodeLabel) {
  // Si se está poniendo como no dirigida, siempre es válido
  if (newDirection === 'none') {
    return { valid: true };
  }

  // Determinar los nodos según la nueva dirección
  let fromId, toId;
  if (newDirection === 'forward') {
    fromId = edge.from;
    toId = edge.to;
  } else if (newDirection === 'backward') {
    fromId = edge.to;
    toId = edge.from;
  }

  // Filtrar las aristas excluyendo la arista actual
  const otherEdges = edges.filter(e => e.id !== edge.id);

  // Validar con las mismas reglas
  return validateEdgeCreation(fromId, toId, otherEdges, getNodeLabel);
};
