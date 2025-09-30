import { ref, computed } from 'vue';

export function useZoomPan(currentTheme, graphSvg, isAddingNode, isAddingEdge, isEraserActive, isEditing, draggedNode, draggedHandle, onDragCallback) {
  const isZoomEnabled = ref(false);
  const zoomLevel = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const isPanning = ref(false);
  const lastMousePos = ref({ x: null, y: null });
  const panDrag = ref(null);
  const canvasBackgroundStyle = ref('grid');
  const canvasBackgroundColor = ref(currentTheme === 'light-theme' ? '#ffffff' : '#333333');

  const svgBackgroundStyles = computed(() => {
    const styles = {};
    const defaultGridColor = currentTheme === 'light-theme' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
    const gridColor = canvasBackgroundStyle.value !== 'blank' ? defaultGridColor : canvasBackgroundColor.value;
    const scaledSizeGrid = 20 * zoomLevel.value;
    const scaledSizeDots = 15 * zoomLevel.value;
    const posX = -panX.value * zoomLevel.value;
    const posY = -panY.value * zoomLevel.value;

    switch (canvasBackgroundStyle.value) {
      case 'grid':
        styles.backgroundImage = `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `;
        styles.backgroundSize = `${scaledSizeGrid}px ${scaledSizeGrid}px`;
        styles.backgroundPosition = `${posX}px ${posY}px`;
        styles.backgroundColor = canvasBackgroundColor.value;
        break;
      case 'dots':
        styles.backgroundImage = `radial-gradient(${gridColor} 1px, transparent 1px)`;
        styles.backgroundSize = `${scaledSizeDots}px ${scaledSizeDots}px`;
        styles.backgroundPosition = `${posX}px ${posY}px`;
        styles.backgroundColor = canvasBackgroundColor.value;
        break;
      case 'blank':
        styles.backgroundColor = canvasBackgroundColor.value;
        styles.backgroundImage = 'none';
        break;
    }
    return styles;
  });

  const toggleZoomMode = () => {
    isZoomEnabled.value = !isZoomEnabled.value;
  };

  const handleWheel = (event) => {
    if (!isZoomEnabled.value) return;
    event.preventDefault();
    const delta = event.deltaY < 0 ? 1.1 : 0.9;
    zoomLevel.value = Math.max(0.3, Math.min(3, zoomLevel.value * delta));
  };

  const startPan = (event, hasPanned) => {
    if (isAddingNode.value || isAddingEdge.value || isEraserActive.value || isEditing.value) return;
    isPanning.value = true;
    const svgRect = graphSvg.value.getBoundingClientRect();
    lastMousePos.value = {
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top
    };
    panDrag.value = {
      startX: event.clientX,
      startY: event.clientY,
      startPanX: panX.value,
      startPanY: panY.value
    };
    hasPanned.value = false;
  };

  const continuePan = (event, hasPanned) => {
    if (isPanning.value && !draggedNode.value && !draggedHandle.value && graphSvg.value) {
      const svgRect = graphSvg.value.getBoundingClientRect();
      const mouseX = event.clientX - svgRect.left;
      const mouseY = event.clientY - svgRect.top;

      if (lastMousePos.value.x !== null && lastMousePos.value.y !== null) {
        const dx = (mouseX - lastMousePos.value.x) / zoomLevel.value;
        const dy = (mouseY - lastMousePos.value.y) / zoomLevel.value;
        panX.value += dx;
        panY.value += dy;
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          hasPanned.value = true;
        }
      }

      lastMousePos.value = { x: mouseX, y: mouseY };
    }
  };

  const stopPan = () => {
    isPanning.value = false;
    panDrag.value = null;
    lastMousePos.value = { x: null, y: null };
  };

  const setCanvasBackground = (style) => {
    canvasBackgroundStyle.value = style;
  };

  return {
    isZoomEnabled,
    zoomLevel,
    panX,
    panY,
    canvasBackgroundStyle,
    canvasBackgroundColor,
    svgBackgroundStyles,
    toggleZoomMode,
    handleWheel,
    startPan,
    continuePan,
    stopPan,
    setCanvasBackground
  };
}