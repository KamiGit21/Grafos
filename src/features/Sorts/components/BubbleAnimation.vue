<template>
  <div class="bubble-visualization">
    <div class="bubbles-container">
      <div 
        v-for="(bubble, index) in array" 
        :key="index"
        :class="[
          'bubble',
          { 
            'comparing': comparingIndices.includes(index),
            'swapping': swappingIndices.includes(index),
            'sorted': sortedIndices.includes(index),
            'current': currentIndex === index
          }
        ]"
        :style="getBubbleStyle(bubble)"
      >
        <span class="bubble-value">{{ bubble }}</span>
      </div>
    </div>
    
    <div class="algorithm-info">
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color normal"></div>
          <span>Normal</span>
        </div>
        <div class="legend-item">
          <div class="legend-color comparing"></div>
          <span>Comparando</span>
        </div>
        <div class="legend-item">
          <div class="legend-color swapping"></div>
          <span>Intercambiando</span>
        </div>
        <div class="legend-item">
          <div class="legend-color sorted"></div>
          <span>Ordenado</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed } from 'vue';

const props = defineProps({
  array: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: -1
  },
  comparingIndices: {
    type: Array,
    default: () => []
  },
  swappingIndices: {
    type: Array,
    default: () => []
  },
  minValue: {
    type: Number,
    default: 10
  },
  maxValue: {
    type: Number,
    default: 300
  },
  isSorting: {
    type: Boolean,
    default: false
  },
  sortedIndices: {
    type: Array,
    default: () => []
  }
});

const getBubbleStyle = (value) => {
  const normalized = (value - props.minValue) / (props.maxValue - props.minValue);
  const size = 30 + normalized * 40; // Tamaño entre 30px y 70px
  const opacity = 0.7 + normalized * 0.3; // Opacidad entre 0.7 y 1.0
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    opacity: opacity.toString()
  };
};
</script>

<style scoped>
.bubble-visualization {
  flex-grow: 1;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.8)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 8px;
  padding: 20px;
  border: 1px solid v-bind('theme === "light-theme" ? "#ddd" : "#555"');
  display: flex;
  flex-direction: column;
}

.bubbles-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
  min-height: 120px;
  flex-grow: 1;
}

.bubble {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 2px solid;
  position: relative;
  background-color: v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  border-color: v-bind('theme === "light-theme" ? "#357abd" : "#5a9de5"');
  color: white;
}

.bubble-value {
  font-size: 0.8rem;
  pointer-events: none;
}

/* Estados de las burbujas */
.bubble.comparing {
  background-color: #e53e3e;
  border-color: #c53030;
  transform: scale(1.1);
  z-index: 10;
}

.bubble.swapping {
  background-color: #d69e2e;
  border-color: #b7791f;
  transform: scale(1.05);
  z-index: 5;
}

.bubble.sorted {
  background-color: #38a169;
  border-color: #2f855a;
}

.bubble.current {
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.8);
}

/* Leyenda */
.algorithm-info {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid v-bind('theme === "light-theme" ? "#ddd" : "#555"');
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid;
}

.legend-color.normal {
  background-color: v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  border-color: v-bind('theme === "light-theme" ? "#357abd" : "#5a9de5"');
}

.legend-color.comparing {
  background-color: #e53e3e;
  border-color: #c53030;
}

.legend-color.swapping {
  background-color: #d69e2e;
  border-color: #b7791f;
}

.legend-color.sorted {
  background-color: #38a169;
  border-color: #2f855a;
}

.legend-item span {
  font-size: 0.9rem;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
}
</style>