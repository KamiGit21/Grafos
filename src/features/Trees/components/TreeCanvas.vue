<template>
  <div class="tree-canvas-container">
    <div ref="canvasContainer" class="tree-canvas" @wheel.prevent="handleZoom" @mousedown.prevent="startDrag" @mouseleave="endDrag">
      <svg :width="width" :height="height" :viewBox="viewBox" class="tree-svg">
        <!-- Líneas de conexión primero (para que queden detrás de los nodos) -->
        <g v-if="tree?.root">
          <line 
            v-for="(line, i) in lines" 
            :key="i" 
            :x1="line.x1" 
            :y1="line.y1" 
            :x2="line.x2" 
            :y2="line.y2" 
            stroke="#4A5568" 
            stroke-width="3"
            class="connection-line"
          />
        </g>
        
        <!-- Nodos después (para que queden sobre las líneas) -->
        <g v-if="tree?.root">
          <g 
            v-for="node in nodes" 
            :key="node.id" 
            :transform="`translate(${node.x}, ${node.y})`" 
            class="tree-node" 
            :class="{ highlighted: highlightedNodes.includes(node.id) }"
          >
            <circle r="25" fill="#4FD1C5" stroke="#2D3748" stroke-width="2" class="node-circle" />
            <text text-anchor="middle" dy="6" fill="white" font-weight="bold" font-size="14" class="node-text">
              {{ node.value }}
            </text>
          </g>
        </g>

        <!-- Líneas de nivel (opcional, para mejor visualización) -->
        <g v-if="showLevelGuides && tree?.root">
          <line 
            v-for="(level, index) in levels" 
            :key="'level-' + index"
            :x1="treeData.bounds.minX" 
            :y1="level.y" 
            :x2="treeData.bounds.maxX" 
            :y2="level.y" 
            stroke="#E2E8F0" 
            stroke-width="1"
            stroke-dasharray="5,5"
            class="level-guide"
          />
          <text 
            v-for="(level, index) in levels" 
            :key="'label-' + index"
            :x="treeData.bounds.minX + 10" 
            :y="level.y - 5" 
            fill="#A0AEC0" 
            font-size="12"
            class="level-label"
          >
            Nivel {{ index }}
          </text>
        </g>
      </svg>
      
      <div class="canvas-controls">
        <button @click="zoomIn" class="control-btn" title="Acercar">+</button>
        <button @click="zoomOut" class="control-btn" title="Alejar">−</button>
        <button @click="fitToScreen" class="control-btn" title="Ajustar">⤢</button>
        <button @click="toggleLevelGuides" class="control-btn" :title="showLevelGuides ? 'Ocultar guías' : 'Mostrar guías'">
          📐
        </button>
        <div class="zoom-info">{{ Math.round(scale * 100) }}%</div>
      </div>
      
      <!-- Indicador cuando no hay árbol -->
      <div v-if="!tree?.root" class="empty-state">
        <div class="empty-icon">🌳</div>
        <p>El árbol está vacío</p>
        <span>Inserta valores para comenzar</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeCanvas',
  props: { tree: Object, highlightedNodes: { type: Array, default: () => [] } },
  data() {
    return {
      width: 1000,  // Pizarra más ancha
      height: 700,  // Pizarra más alta
      scale: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      dragHandler: null,
      upHandler: null,
      showLevelGuides: true
    };
  },
  computed: {
    treeData() {
      return this.tree?.calculatePositions?.() || { positions: {}, bounds: null };
    },
    nodes() {
      return Object.values(this.treeData.positions);
    },
    levels() {
      if (!this.tree?.root || !this.treeData.bounds) return [];
      
      const uniqueLevels = new Set();
      this.nodes.forEach(node => {
        uniqueLevels.add(node.y);
      });
      
      return Array.from(uniqueLevels)
        .sort((a, b) => a - b)
        .map((y, index) => ({ y, level: index }));
    },
    lines() {
      const lines = [];
      
      const addConnection = (parent, child) => {
        if (!parent || !child) return;
        
        // Calcular dirección para hacer la línea más natural
        const dx = child.x - parent.x;
        const dy = child.y - parent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Puntos de inicio y fin ajustados al radio del círculo
          const startX = parent.x + (dx / distance) * 25;
          const startY = parent.y + (dy / distance) * 25;
          const endX = child.x - (dx / distance) * 25;
          const endY = child.y - (dy / distance) * 25;
          
          lines.push({
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY
          });
        }
      };
      
      const traverse = (node) => {
        if (!node) return;
        
        if (node.left) {
          addConnection(node, node.left);
          traverse(node.left);
        }
        if (node.right) {
          addConnection(node, node.right);
          traverse(node.right);
        }
      };
      
      traverse(this.tree?.root);
      return lines;
    },
    viewBox() {
      if (!this.tree?.root || !this.treeData.bounds) {
        return `0 0 ${this.width} ${this.height}`;
      }

      const bounds = this.treeData.bounds;
      const viewWidth = this.width / this.scale;
      const viewHeight = this.height / this.scale;

      const centerX = this.panX + (bounds.minX + bounds.maxX) / 2;
      const centerY = this.panY + (bounds.minY + bounds.maxY) / 2;

      return `${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`;
    }
  },
  methods: {
    handleZoom(e) {
      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const dir = e.deltaY < 0 ? 1.1 : 0.9;
      const oldScale = this.scale;
      this.scale = Math.max(0.1, Math.min(3, this.scale * dir));
      
      // Ajustar el pan para zoom en el punto del mouse
      this.panX += (mx - 0.5) * this.width * (1/oldScale - 1/this.scale);
      this.panY += (my - 0.5) * this.height * (1/oldScale - 1/this.scale);
    },
    startDrag(e) {
      this.isDragging = true;
      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      this.lastX = e.clientX - rect.left;
      this.lastY = e.clientY - rect.top;
      window.addEventListener('mousemove', this.dragHandler);
      window.addEventListener('mouseup', this.upHandler);
    },
    handleDrag(e) {
      if (!this.isDragging) return;
      const rect = this.$refs.canvasContainer.getBoundingClientRect();
      const deltaX = (e.clientX - rect.left - this.lastX) / this.scale;
      const deltaY = (e.clientY - rect.top - this.lastY) / this.scale;
      
      this.panX += deltaX;
      this.panY += deltaY;
      
      this.lastX = e.clientX - rect.left;
      this.lastY = e.clientY - rect.top;
    },
    endDrag() {
      this.isDragging = false;
      window.removeEventListener('mousemove', this.dragHandler);
      window.removeEventListener('mouseup', this.upHandler);
    },
    zoomIn() { 
      this.scale = Math.min(3, this.scale * 1.2); 
    },
    zoomOut() { 
      this.scale = Math.max(0.1, this.scale / 1.2); 
    },
    toggleLevelGuides() {
      this.showLevelGuides = !this.showLevelGuides;
    },
    fitToScreen() {
      if (!this.tree?.root || !this.treeData.bounds) {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        return;
      }

      const bounds = this.treeData.bounds;
      const contentWidth = bounds.maxX - bounds.minX;
      const contentHeight = bounds.maxY - bounds.minY;
      
      // Calcular escala para que quepa todo el contenido con margen
      const scaleX = this.width / (contentWidth + 150);
      const scaleY = this.height / (contentHeight + 150);
      this.scale = Math.min(scaleX, scaleY, 1.5); // Permitir un poco más de zoom
      
      // Centrar
      this.panX = -(bounds.minX + bounds.maxX) / 2;
      this.panY = -(bounds.minY + bounds.maxY) / 2;
    }
  },
  watch: {
    'tree.nodeCount': {
      handler() { 
        this.$nextTick(() => this.fitToScreen()); 
      }
    }
  },
  mounted() {
    this.dragHandler = this.handleDrag.bind(this);
    this.upHandler = this.endDrag.bind(this);
    this.$nextTick(() => this.fitToScreen());
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.dragHandler);
    window.removeEventListener('mouseup', this.upHandler);
  }
};
</script>

<style scoped>
.tree-canvas-container { 
  width: 100%; 
  height: 100%; 
  overflow: hidden; 
  border: 3px solid #e2e8f0; 
  border-radius: 16px; 
  background: #f7fafc; 
  position: relative; 
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tree-canvas { 
  width: 100%; 
  height: 100%; 
  cursor: grab; 
  user-select: none; 
  position: relative;
}

.tree-canvas:active { 
  cursor: grabbing; 
}

.tree-svg { 
  width: 100%; 
  height: 100%; 
}

.connection-line {
  transition: all 0.3s ease;
}

.level-guide {
  opacity: 0.4;
}

.level-label {
  opacity: 0.6;
}

.tree-node { 
  transition: all 0.3s ease; 
}

.node-circle {
  transition: all 0.3s ease;
}

.node-text {
  pointer-events: none;
  user-select: none;
}

.tree-node:hover .node-circle { 
  fill: #38b2ac; 
  transform: scale(1.1);
}

.tree-node.highlighted .node-circle { 
  fill: #ed8936; 
  filter: drop-shadow(0 0 12px rgba(237, 137, 54, 0.8));
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.canvas-controls { 
  position: absolute; 
  top: 16px; 
  right: 16px; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.control-btn { 
  width: 40px; 
  height: 40px; 
  border-radius: 8px; 
  background: white; 
  border: 2px solid #e2e8f0; 
  color: #4a5568; 
  cursor: pointer; 
  font-weight: bold; 
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover { 
  background: #4a90e2; 
  color: white; 
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.zoom-info { 
  background: white; 
  padding: 6px 10px; 
  border-radius: 8px; 
  border: 2px solid #e2e8f0; 
  font-size: 13px; 
  text-align: center; 
  font-weight: 700;
  color: #4a5568;
  margin-top: 4px;
}

.tree-info {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  backdrop-filter: blur(10px);
  font-size: 13px;
  color: #4a5568;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.info-item {
  margin: 4px 0;
  font-weight: 600;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #a0aec0;
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state p {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #718096;
}

.empty-state span {
  font-size: 16px;
  opacity: 0.8;
}
</style>