<template>
  <div class="bubble-visualization" :class="theme">
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
import { computed } from 'vue';

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
  },
  theme: {
    type: String,
    default: 'light-theme'
  }
});

const getBubbleStyle = (value) => {
  const normalized = (value - props.minValue) / (props.maxValue - props.minValue);
  const size = 30 + normalized * 40;
  const opacity = 0.75 + normalized * 0.25;
  
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
  background: rgba(255, 255, 255, 1);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(224, 201, 182, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.dark-theme .bubble-visualization {
  background: rgba(58, 58, 58, 1);
  border-color: rgba(70, 70, 70, 1);
}

.bubbles-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
  min-height: 140px;
  flex-grow: 1;
  padding: 20px 10px;
}

.bubble {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid;
  position: relative;
  background: linear-gradient(135deg, #c9a887 0%, #a08970 100%);
  border-color: #8b7355;
  color: white;
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.3);
}

.dark-theme .bubble {
  background: linear-gradient(135deg, #b89570 0%, #8b7355 100%);
  border-color: #6d5940;
}

.bubble-value {
  font-size: 0.85rem;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Estados de las burbujas */
.bubble.comparing {
  background: linear-gradient(135deg, #e85d5d 0%, #c53030 100%);
  border-color: #9a2424;
  transform: scale(1.15);
  z-index: 10;
  box-shadow: 0 4px 16px rgba(232, 93, 93, 0.5);
  animation: pulse 0.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1.15); }
  50% { transform: scale(1.2); }
}

.bubble.swapping {
  background: linear-gradient(135deg, #d4a574 0%, #b7791f 100%);
  border-color: #9a6517;
  transform: scale(1.1);
  z-index: 5;
  box-shadow: 0 3px 12px rgba(212, 165, 116, 0.4);
}

.bubble.sorted {
  background: linear-gradient(135deg, #82a682 0%, #5d8b5d 100%);
  border-color: #487348;
  box-shadow: 0 2px 8px rgba(130, 166, 130, 0.3);
}

.bubble.current {
  box-shadow: 0 0 20px rgba(201, 168, 135, 0.9);
  border-width: 4px;
}

/* Leyenda */
.algorithm-info {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .algorithm-info {
  border-top-color: rgba(70, 70, 70, 1);
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(248, 238, 226, 0.4);
  border-radius: 20px;
  border: 1px solid rgba(224, 201, 182, 0.3);
  transition: all 0.2s ease;
}

.dark-theme .legend-item {
  background: rgba(68, 68, 68, 0.4);
  border-color: rgba(70, 70, 70, 0.5);
}

.legend-item:hover {
  background: rgba(224, 201, 182, 0.3);
  transform: translateY(-2px);
}

.dark-theme .legend-item:hover {
  background: rgba(80, 80, 80, 0.5);
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.legend-color.normal {
  background: linear-gradient(135deg, #c9a887 0%, #a08970 100%);
  border-color: #8b7355;
}

.dark-theme .legend-color.normal {
  background: linear-gradient(135deg, #b89570 0%, #8b7355 100%);
  border-color: #6d5940;
}

.legend-color.comparing {
  background: linear-gradient(135deg, #e85d5d 0%, #c53030 100%);
  border-color: #9a2424;
}

.legend-color.swapping {
  background: linear-gradient(135deg, #d4a574 0%, #b7791f 100%);
  border-color: #9a6517;
}

.legend-color.sorted {
  background: linear-gradient(135deg, #82a682 0%, #5d8b5d 100%);
  border-color: #487348;
}

.legend-item span {
  font-size: 0.95rem;
  color: #6d5940;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.dark-theme .legend-item span {
  color: #e0c9b6;
}

</style>