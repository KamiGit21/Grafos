<template>
  <div class="animation-controls">
    <h3>Recorridos del Árbol</h3>
    
    <div class="traversal-selection">
      <label>Seleccionar recorrido:</label>
      <select v-model="selectedTraversal" class="traversal-select">
        <option value="inOrder">In-Orden</option>
        <option value="preOrder">Pre-Orden</option>
        <option value="postOrder">Post-Orden</option>
      </select>
    </div>
    
    <div class="control-buttons">
      <button 
        @click="startAnimation" 
        :disabled="!hasNodes || !isComplete || isAnimating" 
        class="action-btn start-btn"
      >
        <span class="btn-icon">▶</span>
        Iniciar animación
      </button>
      <button 
        @click="stopAnimation" 
        :disabled="!isAnimating" 
        class="action-btn stop-btn"
      >
        <span class="btn-icon">⏹</span>
        Detener
      </button>
    </div>
    
    <div v-if="!isComplete && hasNodes" class="warning-message">
      ⚠️ El árbol no está completo. Complete todos los niveles para iniciar recorridos.
    </div>
    
    <div class="speed-control" v-if="isAnimating">
      <label>Velocidad:</label>
      <input 
        type="range" 
        min="100" 
        max="2000" 
        step="100" 
        v-model="animationSpeed"
        @input="updateSpeed"
        class="speed-slider"
      >
      <span class="speed-label">{{ speedLabel }}</span>
    </div>
    
    <div class="traversal-result">
      <label>Resultado {{ traversalName }}:</label>
      <div class="result-display">
        <span 
          v-for="(value, index) in traversalResultArray" 
          :key="index"
          :class="{ 'current': index === currentStep }"
          class="result-item"
        >
          {{ value }}{{ index < traversalResultArray.length - 1 ? ',' : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeAnimationControls',
  props: {
    hasNodes: Boolean,
    isComplete: Boolean, // Nueva prop para verificar si el árbol es completo
    isAnimating: Boolean,
    traversalResult: String,
    currentStep: Number
  },
  data() {
    return {
      selectedTraversal: 'inOrder',
      animationSpeed: 800
    };
  },
  computed: {
    traversalName() {
      const names = {
        inOrder: 'In-Orden',
        preOrder: 'Pre-Orden',
        postOrder: 'Post-Orden'
      };
      return names[this.selectedTraversal];
    },
    traversalResultArray() {
      return this.traversalResult ? this.traversalResult.split(', ') : [];
    },
    speedLabel() {
      if (this.animationSpeed >= 1500) return 'Lenta';
      if (this.animationSpeed >= 800) return 'Normal';
      if (this.animationSpeed >= 400) return 'Rápida';
      return 'Muy rápida';
    }
  },
  methods: {
    startAnimation() {
      this.$emit('start-animation', {
        traversal: this.selectedTraversal,
        speed: this.animationSpeed
      });
    },
    stopAnimation() {
      this.$emit('stop-animation');
    },
    updateSpeed() {
      this.$emit('update-speed', this.animationSpeed);
    }
  }
};
</script>

<style scoped>
.warning-message {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-align: center;
}

/* El resto del CSS permanece igual */
.animation-controls {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 25px;
  border: 2px solid #805ad5;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: 'Oswald', sans-serif;
  backdrop-filter: blur(10px);
}

h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2d3748;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
}

.traversal-selection {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.traversal-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #2d3748;
}

.traversal-select:focus {
  outline: none;
  border-color: #805ad5;
  box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.2);
  transform: translateY(-1px);
}

.control-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 14px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  color: white;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  flex: 1;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: none;
}

.start-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.start-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
}

.stop-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.stop-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(245, 101, 101, 0.4);
}

.btn-icon {
  font-size: 0.8rem;
}

.speed-control {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(128, 90, 213, 0.05), rgba(107, 70, 193, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(128, 90, 213, 0.2);
}

.speed-control label {
  margin-bottom: 15px;
  text-align: center;
  font-size: 1rem;
}

.speed-slider {
  width: 100%;
  margin-bottom: 10px;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #48bb78, #d69e2e, #f56565);
  outline: none;
  -webkit-appearance: none;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #805ad5, #6b46c1);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
}

.speed-label {
  display: block;
  text-align: center;
  font-weight: 600;
  color: #805ad5;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.traversal-result {
  margin-top: 10px;
}

.result-display {
  padding: 20px;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(102, 126, 234, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);
  min-height: 60px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.result-item {
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 600;
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.result-item.current {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.4);
  border: none;
}

/* Responsive */
@media (max-width: 768px) {
  .animation-controls {
    padding: 20px;
  }
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    padding: 12px 15px;
    font-size: 0.9rem;
  }
  
  .speed-control {
    padding: 15px;
  }
  
  .result-display {
    padding: 15px;
  }
  
  .result-item {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .animation-controls {
    background: rgba(45, 55, 72, 0.9);
    border-color: #9f7aea;
    color: #e2e8f0;
  }
  
  h3 {
    color: #f7fafc;
    border-bottom-color: #4a5568;
  }
  
  label {
    color: #f7fafc;
  }
  
  .traversal-select {
    background-color: #4a5568;
    border-color: #718096;
    color: #f7fafc;
  }
  
  .traversal-select:focus {
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.2);
  }
  
  .speed-control {
    background: linear-gradient(135deg, rgba(159, 122, 234, 0.05), rgba(128, 90, 213, 0.05));
    border-color: rgba(159, 122, 234, 0.2);
  }
  
  .speed-label {
    color: #9f7aea;
  }
  
  .result-display {
    background: linear-gradient(135deg, rgba(106, 180, 255, 0.05), rgba(102, 126, 234, 0.05));
    border-color: rgba(106, 180, 255, 0.2);
  }
  
  .result-item {
    background: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }
  
  .result-item.current {
    background: linear-gradient(135deg, #ed8936, #dd6b20);
    color: white;
  }
  
  .warning-message {
    background: #332701;
    border-color: #665c34;
    color: #e2c08d;
  }
}
</style>