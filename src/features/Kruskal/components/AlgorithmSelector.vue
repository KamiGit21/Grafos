
<template>
  <div class="algorithm-modal-overlay" @click.self="$emit('close')" :class="currentTheme">
    <Kruskal
      v-if="optimizationMode === 'maximize'"
      :nodes="nodes"
      :edges="edges"
      :theme="currentTheme"
      @close="$emit('close')"
      @update-graph="$emit('update-graph', $event)"
      @clear-graph="$emit('clear-graph')"
    />
    
    <KruskalMin
      v-if="optimizationMode === 'minimize'"
      :nodes="nodes"
      :edges="edges"
      :theme="currentTheme"
      @close="$emit('close')"
      @update-graph="$emit('update-graph', $event)"
      @clear-graph="$emit('clear-graph')"
    />
  </div>
</template>

<script setup>
import Kruskal from "./Kruskal.vue";
import KruskalMin from "./KruskalMin.vue";

const emit = defineEmits(["close", "update-graph", "clear-graph"]);

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
  edges: {
    type: Array,
    required: true,
  },
  optimizationMode: {
    type: String,
    required: true,
    validator: (value) => ['maximize', 'minimize'].includes(value)
  },
  currentTheme: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.selector-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}


/* Theme styles */
.light-theme {
  background-color: #f9f9f9;
  color: #333;
}


.dark-theme .selector-modal-content {
  background-color: #333;
}

.dark-theme {
  background-color: #3a3a3a;
  color: #e0e0e0;
}
</style>
