/**
 * Calcula el radio de un nodo circular basado en su etiqueta
 */
export function getNodeRadius(node) {
  const baseRadius = 15;
  const extraPerChar = node.label.length > 2 ? (node.label.length - 2) * 3 : 0;
  return 20 + extraPerChar;
}

/**
 * Calcula el radio X de un nodo elíptico basado en su etiqueta
 */
export function getNodeEllipseRx(node) {
  const baseRx = 25;
  const extraPerChar = node.label.length > 2 ? (node.label.length - 2) * 4 : 0;
  return 35 + extraPerChar;
}

/**
 * Calcula la distancia entre dos puntos
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normaliza un ángulo a rango 0-360
 */
export function normalizeAngle(angle) {
  return (angle + 450) % 360;
}