<template>
  <div class="arrays-display">
    <div class="array-section">
      <h4>Antes:</h4>
      <div class="array-values">{{ formatArray(before) }}</div>
    </div>
    
    <div class="array-section">
      <h4>Después:</h4>
      <div class="array-values">{{ formatArray(after) }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  before: {
    type: Array,
    default: () => []
  },
  after: {
    type: Array,
    default: () => []
  }
});

const formatArray = (arr) => {
  return arr.length > 0 ? `[${arr.join(', ')}]` : '[]';
};
</script>

<style scoped>
.arrays-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  font-family: 'Oswald', sans-serif;
}

.array-section {
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.85)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 8px;
  padding: 15px;
  border: 1px solid v-bind('theme === "light-theme" ? "#ddd" : "#555"');
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.array-section h4 {
  margin: 0 0 10px 0;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.array-values {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  word-break: break-all;
  text-align: center;
  line-height: 1.4;
  background: v-bind('theme === "light-theme" ? "rgba(248, 248, 248, 0.8)" : "rgba(68, 68, 68, 0.8)"');
  padding: 10px;
  border-radius: 4px;
  border: 1px solid v-bind('theme === "light-theme" ? "#e0e0e0" : "#444"');
}
</style>