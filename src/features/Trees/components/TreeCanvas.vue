<template>
  <div class="tree-canvas-container">
    <div 
      ref="canvasContainer" 
      class="tree-canvas"
      @wheel="handleZoom"
      @mousedown="startDrag"
      @mouseleave="endDrag"
    >
      <svg 
        :width="width" 
        :height="height" 
        :viewBox="viewBox"
        class="tree-svg"
      >
        <!-- Líneas entre nodos -->
        <g v-if="tree && tree.root">
          <line 
            v-for="(line, index) in lines" 
            :key="'line-' + index"
            :x1="line.x1" 
            :y1="line.y1" 
            :x2="line.x2" 
            :y2="line.y2" 
            stroke="#4A5568" 
            stroke-width="2"
          />
        </g>
        
        <!-- Nodos del árbol -->
        <g v-if="tree && tree.root">
          <g 
            v-for="node in nodes" 
            :key="node.id"
            :transform="`translate(${node.x}, ${node.y})`"
            class="tree-node"
            :class="{ 'highlighted': highlightedNodes.includes(node.id) }"
          >
            <circle 
              r="18"
              fill="#4FD1C5" 
              stroke="#2D3748" 
              stroke-width="2"
            />
            <text 
              text-anchor="middle" 
              dy="5"
              fill="white" 
              font-weight="bold"
              font-size="12"
            >
              {{ node.value }}
            </text>
          </g>
        </g>
      </svg>
      
      <!-- Controles -->
      <div class="canvas-controls">
        <button @click="zoomIn" class="control-btn" title="Acercar">+</button>
        <button @click="zoomOut" class="control-btn" title="Alejar">−</button>
        <button @click="resetView" class="control-btn" title="Resetear vista">↺</button>
        <div class="zoom-info">
          {{ Math.round(scale * 100) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeCanvas',
  props: {
    tree: Object,
    highlightedNodes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      width: 500,
      height: 400,
      scale: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      // Referencias para removeEventListener
      handleDragBound: null,
      endDragBound: null
    };
  },
  computed: {
    viewBox() {
      const w = this.width / this.scale;
      const h = this.height / this.scale;
      const x = -w / 2 + this.translateX;
      const y = -h / 2 + this.translateY;
      return `${x} ${y} ${w} ${h}`;
    },
    nodes() {
      if (!this.tree || !this.tree.root) return [];
      const positions = this.tree.calculatePositions();
      return Object.values(positions);
    },
    lines() {
      if (!this.tree || !this.tree.root) return [];
      const lines = [];
      const traverse = (node) => {
        if (node.left) {
          lines.push({
            x1: node.x, y1: node.y,
            x2: node.left.x, y2: node.left.y
          });
          traverse(node.left);
        }
        if (node.right) {
          lines.push({
            x1: node.x, y1: node.y,
            x2: node.right.x, y2: node.right.y
          });
          traverse(node.right);
        }
      };
      traverse(this.tree.root);
      return lines;
    }
  },
  methods: {
    // ZOOM CENTRADO EN EL CURSOR
    handleZoom(event) {
      event.preventDefault();

      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const mousePercentX = mouseX / rect.width;
      const mousePercentY = mouseY / rect.height;

      const zoomFactor = 0.0018; // Ajusta sensibilidad
      const delta = -event.deltaY * zoomFactor;
      const newScale = this.scale * Math.exp(delta);
      const clampedScale = Math.max(0.3, Math.min(3, newScale));

      if (clampedScale === this.scale) return;

      // Punto en coordenadas del mundo antes del zoom
      const worldX = -this.translateX + (mousePercentX * this.width / this.scale);
      const worldY = -this.translateY + (mousePercentY * this.height / this.scale);

      // Ajustar translate para mantener el punto bajo el cursor
      this.translateX = -worldX + (mousePercentX * this.width / clampedScale);
      this.translateY = -worldY + (mousePercentY * this.height / clampedScale);

      this.scale = clampedScale;
    },

    // ARRASTRE (PAN)
    startDrag(event) {
      if (event.button !== 0) return; // Solo botón izquierdo
      event.preventDefault();

      this.isDragging = true;
      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      this.lastMouseX = event.clientX - rect.left;
      this.lastMouseY = event.clientY - rect.top;

      // Capturar eventos globales
      window.addEventListener('mousemove', this.handleDragBound);
      window.addEventListener('mouseup', this.endDragBound);
    },

    handleDrag(event) {
      if (!this.isDragging) return;
      event.preventDefault();

      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const deltaX = currentX - this.lastMouseX;
      const deltaY = currentY - this.lastMouseY;

      this.translateX += deltaX / this.scale;
      this.translateY += deltaY / this.scale;

      this.lastMouseX = currentX;
      this.lastMouseY = currentY;
    },

    endDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;
      window.removeEventListener('mousemove', this.handleDragBound);
      window.removeEventListener('mouseup', this.endDragBound);
    },

    // BOTONES DE ZOOM
    zoomIn() {
      this.simulateWheel(-300);
    },
    zoomOut() {
      this.simulateWheel(300);
    },
    simulateWheel(deltaY) {
      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      const event = {
        deltaY,
        preventDefault: () => {},
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      };
      this.handleZoom(event);
    },

    // RESETEAR
    resetView() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    }
  },

  // BINDINGS PARA EVENT LISTENERS
  mounted() {
    this.handleDragBound = this.handleDrag.bind(this);
    this.endDragBound = this.endDrag.bind(this);
  },

  beforeUnmount() {
    // Limpieza por si acaso
    window.removeEventListener('mousemove', this.handleDragBound);
    window.removeEventListener('mouseup', this.endDragBound);
  }
};
</script>

<style scoped>
.tree-canvas-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  position: relative;
}

.tree-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  position: relative;
}

.tree-canvas:active {
  cursor: grabbing;
}

.tree-svg {
  width: 100%;
  height: 100%;
}

.tree-node {
  transition: all 0.3s ease;
  cursor: pointer;
}

.tree-node:hover circle {
  fill: #38b2ac;
  stroke: #2c5aa0;
  stroke-width: 3;
}

.tree-node.highlighted circle {
  fill: #ed8936;
  stroke: #c05621;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(237, 137, 54, 0.6));
}

.canvas-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.zoom-info {
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  min-width: 40px;
  text-align: center;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .tree-canvas-container {
    border-color: #4a5568;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }
  
  .control-btn {
    background: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }
  
  .control-btn:hover {
    background: #6ab0ff;
    color: #2d3748;
  }
  
  .zoom-info {
    background: rgba(74, 85, 104, 0.9);
    border-color: #718096;
    color: #e2e8f0;
  }
}
</style>