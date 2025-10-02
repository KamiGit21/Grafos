<template>
  <div class="control-panel">
    <div class="manual-section">
      <h3>Manual</h3>
      
      <div class="controls-grid">
        <div class="control-group">
          <label>Cantidad:</label>
          <div class="input-group">
            <input type="number" v-model.number="localSize" min="5" max="30" @change="validateSize">
            <span class="value-display">{{ localSize }}</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>Mínimo:</label>
          <div class="input-group">
            <input type="number" v-model.number="localMin" @change="validateMin">
            <span class="value-display">{{ localMin }}</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>Máximo:</label>
          <div class="input-group">
            <input type="number" v-model.number="localMax" @change="validateMax">
            <span class="value-display">{{ localMax }}</span>
          </div>
        </div>
      </div>
      
      <div class="algorithm-selection">
        <label>Algoritmo:</label>
        <div class="algorithm-buttons">
          <button 
            @click="selectAlgorithm('bubble')" 
            :class="['algorithm-btn', { 'active': selectedAlgorithm === 'bubble' }]"
          >
            Bubble Sort
          </button>
          <button 
            @click="selectAlgorithm('selection')" 
            :class="['algorithm-btn', { 'active': selectedAlgorithm === 'selection' }]"
          >
            Selection Sort
          </button>
          <button 
            @click="selectAlgorithm('insertion')" 
            :class="['algorithm-btn', { 'active': selectedAlgorithm === 'insertion' }]"
          >
            Insertion Sort
          </button>
        </div>
      </div>
      
      <div class="direction-selection">
        <label>Dirección:</label>
        <div class="direction-buttons">
          <button 
            @click="selectDirection(true)" 
            :class="['direction-btn', { 'active': sortDirection === true }]"
          >
            Ascendente
          </button>
          <button 
            @click="selectDirection(false)" 
            :class="['direction-btn', { 'active': sortDirection === false }]"
          >
            Descendente
          </button>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="generate" class="action-btn generate-btn">Generar Array</button>
        <button @click="sort" class="action-btn sort-btn" :disabled="isSorting && !isPaused">Ordenar</button>
        <button @click="importData" class="action-btn import-btn">Importar</button>
        <button @click="exportData" class="action-btn export-btn">Exportar</button>
      </div>
      
      <div class="timer-display">
        <div class="timer-label">Tiempo de Ejecución:</div>
        <div class="timer-value">{{ elapsedTime.toFixed(2) }} segundos</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const emit = defineEmits(['generate', 'sort', 'import', 'export', 'algorithm-change', 'direction-change']);

const props = defineProps({
  isSorting: Boolean,
  isPaused: Boolean,
  elapsedTime: Number
});

// Campos vacíos inicialmente
const localSize = ref('');
const localMin = ref('');
const localMax = ref('');
const selectedAlgorithm = ref('bubble');
const sortDirection = ref(true);

const validateSize = () => {
  if (localSize.value === '' || localSize.value < 5) localSize.value = 5;
  if (localSize.value > 30) localSize.value = 30;
};

const validateMin = () => {
  if (localMin.value === '') return;
  if (localMin.value < 1) localMin.value = 1;
  if (localMax.value !== '' && localMin.value >= localMax.value) {
    localMin.value = localMax.value - 1;
  }
};

const validateMax = () => {
  if (localMax.value === '') return;
  if (localMax.value < 10) localMax.value = 10;
  if (localMin.value !== '' && localMax.value <= localMin.value) {
    localMax.value = localMin.value + 1;
  }
};

const generate = () => {
  // Usar valores por defecto si están vacíos
  const size = localSize.value === '' ? 15 : localSize.value;
  const min = localMin.value === '' ? 10 : localMin.value;
  const max = localMax.value === '' ? 100 : localMax.value;
  
  // Actualizar los valores locales
  localSize.value = size;
  localMin.value = min;
  localMax.value = max;
  
  emit('generate', size, min, max);
};

const sort = () => {
  emit('sort');
};

const importData = () => {
  const input = prompt('Pega el array (formato: 64, 33, 229, 261):');
  if (input) {
    emit('import', input);
  }
};

const exportData = () => {
  emit('export');
};

const selectAlgorithm = (algorithm) => {
  selectedAlgorithm.value = algorithm;
  emit('algorithm-change', algorithm);
};

const selectDirection = (direction) => {
  sortDirection.value = direction;
  emit('direction-change', direction);
};
</script>

<style scoped>
.control-panel {
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.85)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 12px;
  padding: 20px;
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  height: fit-content;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  font-family: 'Oswald', sans-serif;
  backdrop-filter: blur(10px);
}

.manual-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding-bottom: 10px;
  border-bottom: 1px solid v-bind('theme === "light-theme" ? "#e0e0e0" : "#555"');
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: 500;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  min-width: 70px;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group input {
  width: 60px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid v-bind('theme === "light-theme" ? "#ccc" : "#666"');
  background-color: v-bind('theme === "light-theme" ? "#fff" : "#444"');
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  text-align: center;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  box-shadow: 0 0 0 2px v-bind('theme === "light-theme" ? "rgba(74, 144, 226, 0.2)" : "rgba(106, 180, 255, 0.2)"');
}

.value-display {
  font-weight: 600;
  color: v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  min-width: 25px;
  text-align: center;
  font-size: 0.9rem;
}

.algorithm-selection, .direction-selection {
  margin-bottom: 20px;
}

.algorithm-selection label, .direction-selection label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  text-align: center;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.algorithm-buttons, .direction-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.algorithm-btn, .direction-btn {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
  background-color: v-bind('theme === "light-theme" ? "rgba(248, 248, 248, 0.8)" : "rgba(68, 68, 68, 0.8)"');
  border: 1px solid v-bind('theme === "light-theme" ? "#ddd" : "#555"');
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  letter-spacing: 0.3px;
}

.algorithm-btn.active, .direction-btn.active {
  background-color: v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  border-color: v-bind('theme === "light-theme" ? "#357abd" : "#5a9de5"');
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.algorithm-btn:hover, .direction-btn:hover {
  background-color: v-bind('theme === "light-theme" ? "#e8e8e8" : "#5a5a5a"');
  transform: translateY(-1px);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 12px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  color: white;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.generate-btn {
  background: linear-gradient(135deg, #38a169, #2f855a);
}

.sort-btn {
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.import-btn {
  background: linear-gradient(135deg, #d69e2e, #b7791f);
}

.export-btn {
  background: linear-gradient(135deg, #805ad5, #6b46c1);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  filter: brightness(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: none;
}

.timer-display {
  text-align: center;
  padding: 12px;
  background: v-bind('theme === "light-theme" ? "rgba(74, 144, 226, 0.08)" : "rgba(106, 180, 255, 0.08)"');
  border-radius: 8px;
  border: 1px solid v-bind('theme === "light-theme" ? "rgba(74, 144, 226, 0.3)" : "rgba(106, 180, 255, 0.3)"');
}

.timer-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: v-bind('theme === "light-theme" ? "#555" : "#bbb"');
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.timer-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: v-bind('theme === "light-theme" ? "#2c5282" : "#90cdf4"');
  letter-spacing: 0.5px;
}
</style>