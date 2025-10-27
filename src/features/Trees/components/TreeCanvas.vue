<template>
  <div class="tree-canvas-container">
    <div 
      ref="canvasContainer" 
      class="tree-canvas"
      @wheel="handleZoom"
      @mousedown="startDrag"
      @mousemove="handleDrag"
      @mouseup="endDrag"
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
      
      <!-- Controles de zoom y reset -->
      <div class="canvas-controls">
        <button @click="resetView" class="control-btn" title="Resetear vista">
          ↺
        </button>
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
      width: 600,  // Reducido de 800
      height: 400, // Reducido de 600
      scale: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0
    };
  },
  computed: {
    viewBox() {
      return `${-this.width / 2 + this.translateX} ${-this.height / 2 + this.translateY} ${this.width / this.scale} ${this.height / this.scale}`;
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
            x1: node.x,
            y1: node.y,
            x2: node.left.x,
            y2: node.left.y
          });
          traverse(node.left);
        }
        if (node.right) {
          lines.push({
            x1: node.x,
            y1: node.y,
            x2: node.right.x,
            y2: node.right.y
          });
          traverse(node.right);
        }
      };
      
      traverse(this.tree.root);
      return lines;
    }
  },
  methods: {
    handleZoom(event) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      this.scale *= delta;
      // Limitar zoom
      this.scale = Math.max(0.3, Math.min(3, this.scale));
    },
    startDrag(event) {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    },
    handleDrag(event) {
      if (!this.isDragging) return;
      
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      
      this.translateX += deltaX / this.scale;
      this.translateY += deltaY / this.scale;
      
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    },
    endDrag() {
      this.isDragging = false;
    },
    resetView() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    }
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
  font-size: 14px;
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