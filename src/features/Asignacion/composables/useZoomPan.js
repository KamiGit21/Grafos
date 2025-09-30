
import { ref, computed } from 'vue';

export function useZoomPan(
  currentTheme,
  graphSvg,
  isAddingNode,
  isAddingEdge,
  isEraserActive,
  isEditing,
  draggedNode,
  draggedHandle,
  onDrag
) {
  const isZoomEnabled = ref(false);
  const zoomLevel = ref(1);
  const panX = ref(0);
  const panY = ref(0);
  const canvasBackgroundStyle = ref('grid');
  const canvasBackgroundColor = ref('#ffffff');
  
  const isPanning = ref(false);
  const panStartX = ref(0);
  const panStartY = ref(0);
  const panOffsetX = ref(0);
  const panOffsetY = ref(0);

  const svgBackgroundStyles = computed(() => {
    const baseStyles = {};
    const defaultGridColor = currentTheme === 'light-theme' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
    const gridColor = canvasBackgroundStyle.value !== 'blank' ? defaultGridColor : canvasBackgroundColor.value;
    const scaledSizeGrid = 20 * zoomLevel.value;
    const scaledSizeDots = 15 * zoomLevel.value;
    const posX = -panX.value * zoomLevel.value;
    const posY = -panY.value * zoomLevel.value;

    switch (canvasBackgroundStyle.value) {
      case 'grid':
        baseStyles.backgroundImage = `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `;
        baseStyles.backgroundSize = `${scaledSizeGrid}px ${scaledSizeGrid}px`;
        baseStyles.backgroundColor = canvasBackgroundColor.value;
        baseStyles.backgroundPosition = `${posX}px ${posY}px`;
        break;
      case 'dots':
        baseStyles.backgroundImage = `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`;
        baseStyles.backgroundSize = `${scaledSizeDots}px ${scaledSizeDots}px`;
        baseStyles.backgroundColor = canvasBackgroundColor.value;
        baseStyles.backgroundPosition = `${posX}px ${posY}px`;
        break;
      case 'blank':
        baseStyles.backgroundColor = canvasBackgroundColor.value;
        break;
    }

    return baseStyles;
  });

  const toggleZoomMode = () => {
    isZoomEnabled.value = !isZoomEnabled.value;
  };

  const handleWheel = (event) => {
    if (!isZoomEnabled.value) return;
    
    event.preventDefault();
    
    // Obtener el elemento SVG correctamente
    let svgElement = graphSvg.value?.svgElement;
    if (!svgElement) {
      const graphSvgValue = graphSvg.value;
      if (graphSvgValue?.$el) {
        svgElement = graphSvgValue.$el.querySelector('svg');
      }
    }
    
    if (!svgElement) return;

    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    const worldX = (mouseX - panX.value) / zoomLevel.value;
    const worldY = (mouseY - panY.value) / zoomLevel.value;

    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel.value * delta));

    panX.value = mouseX - worldX * newZoom;
    panY.value = mouseY - worldY * newZoom;
    zoomLevel.value = newZoom;
  };

  const startPan = (event, hasPanned) => {
    if (isAddingNode.value || isAddingEdge.value || isEraserActive.value || isEditing.value) return;
    if (draggedNode.value || draggedHandle.value) return;

    // Obtener el elemento SVG correctamente
    let svgElement = graphSvg.value?.svgElement;
    if (!svgElement) {
      const graphSvgValue = graphSvg.value;
      if (graphSvgValue?.$el) {
        svgElement = graphSvgValue.$el.querySelector('svg');
      }
    }
    
    if (!svgElement) return;

    const svgRect = svgElement.getBoundingClientRect();
    const clickX = event.clientX - svgRect.left;
    const clickY = event.clientY - svgRect.top;

    const tolerance = 5;
    let clickedOnElement = false;

    const allElements = svgElement.querySelectorAll('.node-group, path[stroke="transparent"]');
    allElements.forEach((el) => {
      const bbox = el.getBBox ? el.getBBox() : null;
      if (bbox) {
        const worldClickX = (clickX - panX.value) / zoomLevel.value;
        const worldClickY = (clickY - panY.value) / zoomLevel.value;
        if (
          worldClickX >= bbox.x - tolerance &&
          worldClickX <= bbox.x + bbox.width + tolerance &&
          worldClickY >= bbox.y - tolerance &&
          worldClickY <= bbox.y + bbox.height + tolerance
        ) {
          clickedOnElement = true;
        }
      }
    });

    if (clickedOnElement) return;

    isPanning.value = true;
    panStartX.value = event.clientX;
    panStartY.value = event.clientY;
    panOffsetX.value = panX.value;
    panOffsetY.value = panY.value;
    hasPanned.value = false;
  };

  const continuePan = (event, hasPanned) => {
    if (!isPanning.value) return;

    const dx = event.clientX - panStartX.value;
    const dy = event.clientY - panStartY.value;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasPanned.value = true;
    }

    panX.value = panOffsetX.value + dx;
    panY.value = panOffsetY.value + dy;
  };

  const stopPan = () => {
    isPanning.value = false;
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