<template>
  <section class="canvas-area">
    <svg 
      ref="svgElement"
      class="graph-svg" 
      :style="svgBackgroundStyles" 
      @click.self="$emit('canvas-click', $event)" 
      @mousemove="$emit('on-drag', $event)" 
      @mouseup="$emit('stop-drag')" 
      @mouseleave="$emit('stop-drag')" 
      @wheel.prevent="$emit('wheel', $event)"
      @mousedown.self="$emit('mousedown', $event)"
    >
      <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">
        <defs>
          <marker 
            id="arrow" 
            viewBox="0 0 10 10" 
            refX="8" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path 
              d="M 0 0 L 10 5 L 0 10 z" 
              :fill="currentTheme === 'light-theme' ? '#555' : '#ccc'"
            />
          </marker>
        </defs>

        <!-- Edges -->
        <g v-for="edge in edgesWithCoords" :key="edge.id">
          <!-- Transparent path for click sensitivity -->
          <path 
            :d="edge.pathData" 
            stroke="transparent" 
            stroke-width="10" 
            fill="none"
            style="pointer-events: visibleStroke;" 
            @click.stop="$emit('select-element', edge)" 
          />
          <!-- Visible path -->
          <path 
            :d="edge.pathData" 
            :stroke="edge.color" 
            :stroke-width="edge.strokeWidth"
            :stroke-dasharray="edge.strokeDasharray" 
            fill="none" 
            :marker-end="edge.directed ? 'url(#arrow)' : null"
            style="pointer-events: none;"
            :class="{ 'selected': selectedElement && selectedElement.id === edge.id }" 
          />
          <!-- Edge label -->
          <text 
            :x="edge.textX" 
            :y="edge.textY" 
            text-anchor="middle" 
            class="edge-label"
            @click.stop="$emit('select-element', edge)"
          >
            {{ edge.value }}
          </text>
        </g>

        <!-- Nodes -->
        <g 
          v-for="node in nodes" 
          :key="node.id" 
          :transform="`translate(${node.x}, ${node.y})`"
          @mousedown.stop="$emit('start-drag', node, $event)" 
          @click.stop="$emit('node-click', node)"
          :class="['node-group', node.shape, { 
            'selected': selectedElement && selectedElement.id === node.id || edgeStartNode?.id === node.id 
          }]"
        >
          <circle 
            v-if="node.shape === 'circle'" 
            :r="getNodeRadius(node)" 
            :fill="node.color"
            :stroke="node.borderColor" 
            stroke-width="2" 
          />
          <ellipse 
            v-else 
            :rx="getNodeEllipseRx(node)" 
            ry="25" 
            :fill="node.color" 
            :stroke="node.borderColor"
            stroke-width="2" 
          />
          <text class="node-label">{{ node.label }}</text>
        </g>

        <!-- Control handle for edges -->
        <g v-if="selectedElementHandlePos.visible">
          <circle 
            :cx="selectedElementHandlePos.x" 
            :cy="selectedElementHandlePos.y" 
            r="8"
            class="manipulation-handle" 
            @mousedown.stop="$emit('start-handle-drag')" 
          />
        </g>

        <!-- Flip button for directed edges -->
        <g 
          v-if="flipButtonPosition.visible"
          :transform="`translate(${flipButtonPosition.x}, ${flipButtonPosition.y})`"
          @click.stop="$emit('flip-edge')" 
          class="flip-handle"
        >
          <circle r="10" class="flip-handle-bg" />
          <path d="M 0 -4 A 4 4 0 1 1 -4 0 M -4 0 L -7 -3 M -4 0 L -1 -3" class="flip-handle-icon" />
        </g>
      </g>
    </svg>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { getNodeRadius, getNodeEllipseRx } from '../utils/graphHelpers';

const svgElement = ref(null);

defineProps({
  nodes: Array,
  edgesWithCoords: Array,
  selectedElement: Object,
  edgeStartNode: Object,
  currentTheme: String,
  svgBackgroundStyles: Object,
  zoomLevel: Number,
  panX: Number,
  panY: Number,
  selectedElementHandlePos: Object,
  flipButtonPosition: Object,
  isEditing: Boolean
});

defineEmits([
  'canvas-click',
  'node-click',
  'select-element',
  'start-drag',
  'on-drag',
  'stop-drag',
  'start-handle-drag',
  'flip-edge',
  'wheel',
  'mousedown'
]);

// Exponer el elemento SVG para que el padre pueda acceder
defineExpose({
  svgElement
});
</script>

<style scoped>
.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.graph-svg {
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
  border-width: 1px;
  border-style: solid;
  border-color: #dcdcdc;
  user-select: none;
}

.node-group {
  cursor: grab;
  transition: filter 0.2s;
}

.node-group:hover {
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}

.node-group.selected {
  filter: drop-shadow(0 0 8px rgba(0, 120, 255, 0.7));
}

.node-label {
  text-anchor: middle;
  dominant-baseline: central;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  user-select: none;
  fill: #333;
}

.edge-label {
  font-size: 12px;
  fill: #333;
  user-select: none;
}

path.selected {
  filter: drop-shadow(0 0 4px rgba(0, 120, 255, 0.7));
}

.manipulation-handle {
  fill: rgba(0, 120, 255, 0.7);
  stroke: #fff;
  stroke-width: 2;
  cursor: move;
}

.flip-handle {
  cursor: pointer;
}

.flip-handle-bg {
  fill: #f0f0f0;
  stroke: #888;
  stroke-width: 2;
}

.flip-handle-icon {
  fill: none;
  stroke: #333;
  stroke-width: 1.5;
  stroke-linecap: round;
}

.flip-handle:hover .flip-handle-bg {
  fill: #e0e0e0;
}
</style>