<template>
  <div class="arrays-display" :class="theme">
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
  },
  theme: {
    type: String,
    default: 'light-theme'
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
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(224, 201, 182, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-theme .array-section {
  background: rgba(58, 58, 58, 1);
  border-color: rgba(70, 70, 70, 1);
}

.array-section h4 {
  margin: 0 0 12px 0;
  color: #8b7355;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.dark-theme .array-section h4 {
  color: #c9b4a4;
}

.array-values {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #6d5940;
  word-break: break-all;
  text-align: center;
  line-height: 1.6;
  background: rgba(248, 238, 226, 0.5);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(224, 201, 182, 0.4);
}

.dark-theme .array-values {
  background: rgba(58, 58, 58, 0.8);
  border-color: rgba(70, 70, 70, 0.5);
  color: #e0c9b6;
}
</style>