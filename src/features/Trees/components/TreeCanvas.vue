<template>
  <div class="tree-canvas-container">
    <div ref="canvasContainer" class="tree-canvas" @wheel.prevent="handleZoom" @mousedown.prevent="startDrag" @mouseleave="endDrag">
      <svg :width="width" :height="height" :viewBox="viewBox" class="tree-svg">
        <g v-if="tree?.root">
          <line v-for="(line, i) in lines" :key="i" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" stroke="#4A5568" stroke-width="2" />
        </g>
        <g v-if="tree?.root">
          <g v-for="node in nodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`" class="tree-node" :class="{ highlighted: highlightedNodes.includes(node.id) }">
            <circle r="20" fill="#4FD1C5" stroke="#2D3748" stroke-width="2" />
            <text text-anchor="middle" dy="5" fill="white" font-weight="bold" font-size="12">{{ node.value }}</text>
          </g>
        </g>
      </svg>
      <div class="canvas-controls">
        <button @click="zoomIn" class="control-btn">+</button>
        <button @click="zoomOut" class="control-btn">−</button>
        <button @click="fitToScreen" class="control-btn">Fit</button>
        <div class="zoom-info">{{ Math.round(scale * 100) }}%</div>
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
      width: 800,
      height: 600,
      scale: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      dragHandler: null,
      upHandler: null
    };
  },
  computed: {
    treeData() {
      return this.tree?.calculatePositions?.() || { positions: {}, bounds: null };
    },
    nodes() {
      return Object.values(this.treeData.positions);
    },
    lines() {
      const lines = [];
      const traverse = (node) => {
        if (!node) return;
        if (node.left) {
          lines.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y });
          traverse(node.left);
        }
        if (node.right) {
          lines.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y });
          traverse(node.right);
        }
      };
      traverse(this.tree?.root);
      return lines;
    },
    // VIEWBOX: RAÍZ ARRIBA FIJA
    viewBox() {
      if (!this.tree?.root || !this.treeData.bounds) {
        return `0 0 ${this.width} ${this.height}`;
      }

      const rootY = this.tree.root.y;
      const topMargin = 30; // ESPACIO ARRIBA

      const viewWidth = this.width / this.scale;
      const viewHeight = this.height / this.scale;

      const centerX = this.panX;

      // Y FIJO: raíz arriba
      const y = rootY - topMargin + this.panY;

      return `${centerX - viewWidth / 2} ${y} ${viewWidth} ${viewHeight}`;
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
      this.panX += (mx - 0.5) * this.width * (1/oldScale - 1/this.scale);
      this.panY += (my) * this.height * (1/oldScale - 1/this.scale); // solo vertical si quieres
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
      this.panX += (e.clientX - rect.left - this.lastX) / this.scale;
      this.panY += (e.clientY - rect.top - this.lastY) / this.scale;
      this.lastX = e.clientX - rect.left;
      this.lastY = e.clientY - rect.top;
    },
    endDrag() {
      this.isDragging = false;
      window.removeEventListener('mousemove', this.dragHandler);
      window.removeEventListener('mouseup', this.upHandler);
    },
    zoomIn() { this.scale = Math.min(3, this.scale * 1.2); },
    zoomOut() { this.scale = Math.max(0.1, this.scale / 1.2); },
    fitToScreen() {
      this.scale = 1;
      this.panX = 0;
      this.panY = 0;
    }
  },
  watch: {
    'tree.insertionOrder': {
      handler() { this.$nextTick(() => this.fitToScreen()); },
      deep: true
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
.tree-canvas-container { width: 100%; height: 100%; overflow: hidden; border: 2px solid #e2e8f0; border-radius: 12px; background: #f7fafc; position: relative; }
.tree-canvas { width: 100%; height: 100%; cursor: grab; user-select: none; }
.tree-canvas:active { cursor: grabbing; }
.tree-svg { width: 100%; height: 100%; }
.tree-node { transition: all 0.2s; }
.tree-node:hover circle { fill: #38b2ac; }
.tree-node.highlighted circle { fill: #ed8936; }
.canvas-controls { position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 5px; }
.control-btn { width: 32px; height: 32px; border-radius: 6px; background: white; border: 1px solid #e2e8f0; color: #4a5568; cursor: pointer; font-weight: bold; }
.control-btn:hover { background: #4a90e2; color: white; }
.zoom-info { background: white; padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 12px; text-align: center; }
</style>