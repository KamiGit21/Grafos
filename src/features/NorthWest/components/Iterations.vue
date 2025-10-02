<template>
  <div :class="['iterations-container', theme]">
    <div v-if="!iterations || iterations.length === 0" class="iterations-empty">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>Configura la matriz y presiona "Resolver" para ver las iteraciones</p>
    </div>

    <div v-else>
      <!-- Control de iteraciones -->
      <div class="iteration-controls">
        <div class="iteration-header">
          <h3>Iteraciones del Método Simplex de Transporte</h3>
          <span class="iteration-counter">
            Iteración {{ currentIteration + 1 }} / {{ iterations.length }}
          </span>
        </div>
        
        <div class="slider-controls">
          <button 
            @click="previousIteration"
            :disabled="currentIteration === 0"
            class="nav-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <input
            type="range"
            v-model.number="currentIteration"
            :min="0"
            :max="iterations.length - 1"
            class="iteration-slider"
          />
          
          <button 
            @click="nextIteration"
            :disabled="currentIteration === iterations.length - 1"
            class="nav-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="cost-display">
          <span class="cost-label">
            {{ optimizationMode === 'minimize' ? 'Costo Total (Z):' : 'Beneficio Total (Z):' }}
          </span>
          <span class="cost-value">{{ currentIterationData.totalCost?.toFixed(2) || 0 }}</span>
        </div>
      </div>

      <!-- Matriz de la iteración actual -->
      <div class="iteration-matrix">
        <h4>Matriz de Asignación</h4>
        <div class="table-wrapper">
          <table class="solution-table">
            <thead>
              <tr>
                <th class="corner-cell">Origen\Destino</th>
                <th v-for="(dest, idx) in destinations" :key="'h-' + idx" class="header-cell">
                  {{ dest }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in currentIterationData.solution" :key="'r-' + i">
                <th class="row-header">{{ sources[i] }}</th>
                <td 
                  v-for="(value, j) in row" 
                  :key="'c-' + j"
                  :class="['matrix-cell', { 'has-value': value > 0 }]"
                >
                  {{ value > 0 ? value.toFixed(2) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resultado final -->
      <div v-if="isLastIteration" class="final-result">
        <div class="result-header">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>Solución Óptima Encontrada</h3>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="result-label">
              {{ optimizationMode === 'minimize' ? 'Costo Mínimo:' : 'Beneficio Máximo:' }}
            </span>
            <span class="result-value">{{ currentIterationData.totalCost?.toFixed(2) }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Iteraciones:</span>
            <span class="result-value">{{ iterations.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  iterations: Array,
  sources: Array,
  destinations: Array,
  optimizationMode: String,
  theme: String
});

const currentIteration = ref(0);

watch(() => props.iterations?.length, (newLength) => {
  if (newLength > 0) {
    currentIteration.value = newLength - 1;
  }
});

const currentIterationData = computed(() => {
  if (!props.iterations || props.iterations.length === 0) {
    return { solution: [], totalCost: 0 };
  }
  return props.iterations[currentIteration.value] || { solution: [], totalCost: 0 };
});

const isLastIteration = computed(() => {
  return currentIteration.value === props.iterations.length - 1;
});

const nextIteration = () => {
  if (currentIteration.value < props.iterations.length - 1) {
    currentIteration.value++;
  }
};

const previousIteration = () => {
  if (currentIteration.value > 0) {
    currentIteration.value--;
  }
};
</script>

<style scoped>
.iterations-container {
  background: rgba(255, 255, 255, 1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .iterations-container {
  background: rgba(58, 58, 58, 1);
  border-color: rgba(70, 70, 70, 0.5);
}

.iterations-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 16px;
}

.iterations-empty svg {
  width: 64px;
  height: 64px;
  color: #c9b4a4;
  opacity: 0.5;
}

.iterations-empty p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #8b7355;
}

.iteration-controls {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(224, 201, 182, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
}

.iteration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.iteration-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #8b7355;
}

.dark-theme .iteration-header h3 {
  color: #c9b4a4;
}

.iteration-counter {
  padding: 6px 14px;
  background: rgba(201, 168, 135, 0.2);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #6d5940;
}

.slider-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  background: rgba(224, 201, 182, 0.3);
  border: 1px solid rgba(224, 201, 182, 0.4);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #8b7355;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(224, 201, 182, 0.5);
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}

.iteration-slider {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: rgba(224, 201, 182, 0.2);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.iteration-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c9a887, #a08970);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.iteration-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.iteration-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c9a887, #a08970);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cost-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.08));
  border-radius: 10px;
  border: 2px solid rgba(33, 150, 243, 0.3);
}

.cost-label {
  font-size: 15px;
  font-weight: 600;
  color: #1976d2;
}

.cost-value {
  font-size: 24px;
  font-weight: 800;
  color: #1565c0;
  font-family: 'Courier New', monospace;
}

.iteration-matrix {
  margin-bottom: 24px;
}

.iteration-matrix h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #8b7355;
}

.dark-theme .iteration-matrix h4 {
  color: #c9b4a4;
}

.table-wrapper {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.3);
  max-height: 500px;
}

.solution-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 500px;
}

.solution-table th,
.solution-table td {
  padding: 14px;
  text-align: center;
  border: 1px solid rgba(224, 201, 182, 0.2);
  transition: all 0.2s ease;
}

.corner-cell {
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.2), rgba(201, 168, 135, 0.15));
  font-weight: 700;
  color: #8b7355;
  position: sticky;
  left: 0;
  top: 0;
  z-index: 3;
}

.header-cell {
  background: linear-gradient(180deg, rgba(224, 201, 182, 0.25), rgba(224, 201, 182, 0.15));
  font-weight: 700;
  color: #8b7355;
  position: sticky;
  top: 0;
  z-index: 2;
}

.row-header {
  background: linear-gradient(90deg, rgba(224, 201, 182, 0.25), rgba(224, 201, 182, 0.15));
  font-weight: 700;
  color: #8b7355;
  position: sticky;
  left: 0;
  z-index: 1;
}

.matrix-cell {
  background: rgba(255, 255, 255, 0.5);
  color: #999;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.matrix-cell.has-value {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  color: #4caf50;
  font-weight: 800;
  font-size: 16px;
}

.matrix-cell:hover {
  background: rgba(243, 232, 221, 0.7);
  transform: scale(1.02);
}

.final-result {
  padding: 24px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.08));
  border-radius: 12px;
  border: 2px solid rgba(76, 175, 80, 0.4);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(76, 175, 80, 0.3);
}

.result-header svg {
  width: 32px;
  height: 32px;
  color: #4caf50;
}

.result-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #4caf50;
}

.result-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.result-label {
  font-size: 13px;
  font-weight: 600;
  color: #6d5940;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-value {
  font-size: 28px;
  font-weight: 800;
  color: #4caf50;
  font-family: 'Courier New', monospace;
}

/* Dark Theme */
.dark-theme .iteration-controls {
  background: rgba(70, 70, 70, 1);
  border-color: rgba(70, 70, 70, 1);
}

.dark-theme .nav-btn {
  background: rgba(70, 70, 70, 1);
  border-color: rgba(70, 70, 70, 1);
  color: #c9b4a4;
}

.dark-theme .nav-btn:hover:not(:disabled) {
  background: rgba(90, 90, 90, 1);
}

.dark-theme .cost-display {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.25), rgba(33, 150, 243, 0.15));
  border-color: rgba(33, 150, 243, 0.4);
}

.dark-theme .cost-label {
  color: #64b5f6;
}

.dark-theme .cost-value {
  color: #42a5f5;
}

.dark-theme .corner-cell,
.dark-theme .header-cell,
.dark-theme .row-header {
  background: linear-gradient(135deg, rgba(70, 70, 70, 0.5), rgba(90, 90, 90, 0.4));
  color: #c9b4a4;
}

.dark-theme .matrix-cell {
  background: rgba(58, 58, 58, 1);
}

.dark-theme .matrix-cell.has-value {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.2));
  color: #81c784;
}

.dark-theme .final-result {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.12));
  border-color: rgba(76, 175, 80, 0.5);
}

.dark-theme .result-item {
  background: rgba(58, 58, 58, 0.7);
  border-color: rgba(76, 175, 80, 0.4);
}

.dark-theme .result-label {
  color: #c9b4a4;
}

/* Scrollbar */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(224, 201, 182, 0.1);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(224, 201, 182, 0.4);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(224, 201, 182, 0.6);
}
</style>