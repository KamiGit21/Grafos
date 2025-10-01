<template>
  <div class="matrix-modal-overlay" @click.self="$emit('close')">
    <div :class="['matrix-modal-content', currentTheme]">
      <header class="matrix-modal-header">
        <div class="header-left">
          <div class="matrix-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H4a1 1 0 0 0-1 1v5M9 3h6M9 3v6m6-6h5a1 1 0 0 1 1 1v5m0 0v6m0-6h-6M21 15v5a1 1 0 0 1-1 1h-5m0 0H9m6 0v-6M9 21H4a1 1 0 0 1-1-1v-5m0 0V9m0 6h6M3 9h6m0 0v6m6-6h6m-6 0v6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>Problema de Asignación</h2>
            <span class="node-count" v-if="hasData">
              {{ optimizationMode === 'minimize' ? 'Minimización' : 'Maximización' }} | 
              {{ assignmentMatrix.length }} × {{ assignmentMatrix[0]?.length || 0 }}
            </span>
          </div>
        </div>
        <button @click="$emit('close')" class="close-button" title="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </header>
      
      <main class="matrix-modal-body" :class="currentTheme">
        <div v-if="hasData">
          <!-- Controles de iteraciones -->
          <div v-if="hungarianResult.iterations.length > 0" class="iteration-controls">
            <div class="iteration-info">
              <span class="iteration-label">
                {{ currentIteration === hungarianResult.iterations.length ? 'Solución Final' : hungarianResult.iterations[currentIteration].step }}
              </span>
              <span class="iteration-counter">
                {{ currentIteration + 1 }} / {{ hungarianResult.iterations.length + 1 }}
              </span>
            </div>
            <div class="slider-container">
              <button 
                @click="previousIteration" 
                :disabled="currentIteration === 0"
                class="iteration-button"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <input 
                type="range" 
                v-model.number="currentIteration" 
                :min="0" 
                :max="hungarianResult.iterations.length"
                class="iteration-slider"
              />
              <button 
                @click="nextIteration" 
                :disabled="currentIteration === hungarianResult.iterations.length"
                class="iteration-button"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <p class="iteration-description" v-if="currentIterationData.description">
              {{ currentIterationData.description }}
            </p>
          </div>

          <!-- Matriz -->
          <div class="table-container">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th class="corner-cell">
                    <div class="corner-content">
                      <span class="corner-label">Origen</span>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="corner-label">Destino</span>
                    </div>
                  </th>
                  <th v-for="(node, idx) in nodes" :key="'h' + node.id" class="header-cell">
                    <span class="node-label">{{ node.label }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in currentIterationData.matrix" :key="'r' + nodes[rowIndex].id">
                  <th class="row-header">
                    <span class="node-label">{{ nodes[rowIndex].label }}</span>
                  </th>
                  <td 
                    v-for="(value, colIndex) in row" 
                    :key="'c' + colIndex"
                    :class="getCellClass(rowIndex, colIndex)"
                  >
                    <span class="weight-value">{{ formatValue(value) }}</span>
                    <div v-if="isSolutionCell(rowIndex, colIndex)" class="assignment-indicator">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Resultados -->
          <div v-if="showSolution" class="solution-section">
            <div class="solution-header">
              <h3>Asignaciones Óptimas</h3>
              <div class="total-cost">
                <span class="cost-label">Costo Total:</span>
                <span class="cost-value">{{ hungarianResult.totalCost }}</span>
              </div>
            </div>
            <div class="assignments-list">
              <div 
                v-for="(assignment, idx) in hungarianResult.assignments" 
                :key="idx"
                class="assignment-item"
              >
                <div class="assignment-node from-node">{{ assignment.fromLabel }}</div>
                <div class="assignment-arrow">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="assignment-node to-node">{{ assignment.toLabel }}</div>
                <div class="assignment-cost">{{ assignment.cost }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No hay datos para resolver el problema de asignación</p>
          <span class="empty-hint">Agrega nodos y aristas con valores al grafo para comenzar</span>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  nodes: Array,
  assignmentMatrix: Array,
  hungarianResult: Object,
  optimizationMode: String,
  currentTheme: String
});

defineEmits(['close']);

const currentIteration = ref(props.hungarianResult?.iterations?.length || 0);

const hasData = computed(() => {
  return props.nodes.length > 0 && props.assignmentMatrix.length > 0;
});

const showSolution = computed(() => {
  return currentIteration.value === props.hungarianResult.iterations.length;
});

const currentIterationData = computed(() => {
  if (currentIteration.value === props.hungarianResult.iterations.length) {
    // Mostrar la solución final
    return {
      matrix: props.assignmentMatrix,
      step: 'Solución Final',
      description: 'Asignaciones óptimas encontradas'
    };
  }
  return props.hungarianResult.iterations[currentIteration.value] || { matrix: [], step: '', description: '' };
});

const nextIteration = () => {
  if (currentIteration.value < props.hungarianResult.iterations.length) {
    currentIteration.value++;
  }
};

const previousIteration = () => {
  if (currentIteration.value > 0) {
    currentIteration.value--;
  }
};

const isSolutionCell = (row, col) => {
  if (!showSolution.value) return false;
  return props.hungarianResult.assignments.some(a => {
    const fromIndex = props.nodes.findIndex(n => n.id === a.from);
    const toIndex = props.nodes.findIndex(n => n.id === a.to);
    return fromIndex === row && toIndex === col;
  });
};

const getCellClass = (row, col) => {
  const classes = ['matrix-cell'];
  
  if (isSolutionCell(row, col)) {
    classes.push('solution-cell');
  }
  
  if (props.assignmentMatrix[row]?.[col] > 0) {
    classes.push('has-value');
  }
  
  if (row === col) {
    classes.push('diagonal-cell');
  }
  
  return classes;
};

const formatValue = (value) => {
  if (typeof value === 'number') {
    return value % 1 === 0 ? value : value.toFixed(2);
  }
  return value;
};
</script>

<style scoped>
.matrix-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.matrix-modal-content {
  max-width: 90%;
  max-height: 85%;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.matrix-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(224, 201, 182, 0.2);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.matrix-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.2), rgba(201, 168, 135, 0.2));
  border-radius: 10px;
  color: #c9a887;
}

.matrix-icon svg {
  width: 22px;
  height: 22px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.matrix-modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.node-count {
  font-size: 12px;
  font-weight: 600;
  color: #a08970;
  letter-spacing: 0.5px;
}

.close-button {
  width: 36px;
  height: 36px;
  background: rgba(224, 201, 182, 0.15);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #8b7355;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.close-button:hover {
  background: rgba(224, 201, 182, 0.3);
  transform: rotate(90deg);
  color: #6d5940;
}

.matrix-modal-body {
  padding: 24px;
  overflow: auto;
  flex: 1;
}

/* Iteration Controls */
.iteration-controls {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(224, 201, 182, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
}

.iteration-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.iteration-label {
  font-size: 14px;
  font-weight: 700;
  color: #8b7355;
}

.iteration-counter {
  font-size: 12px;
  font-weight: 600;
  color: #a08970;
  background: rgba(255, 255, 255, 0.5);
  padding: 4px 12px;
  border-radius: 20px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.iteration-button {
  width: 32px;
  height: 32px;
  background: rgba(224, 201, 182, 0.2);
  border: 1px solid rgba(224, 201, 182, 0.3);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #8b7355;
}

.iteration-button:hover:not(:disabled) {
  background: rgba(224, 201, 182, 0.4);
  transform: scale(1.05);
}

.iteration-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.iteration-button svg {
  width: 16px;
  height: 16px;
}

.iteration-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(224, 201, 182, 0.2);
  outline: none;
  -webkit-appearance: none;
}

.iteration-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c9a887, #a08970);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.iteration-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.iteration-description {
  margin-top: 12px;
  font-size: 13px;
  color: #6d5940;
  font-style: italic;
  text-align: center;
}

/* Table */
.table-container {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
  margin-bottom: 24px;
}

.matrix-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: max-content;
}

.matrix-table th,
.matrix-table td {
  padding: 12px 16px;
  text-align: center;
  min-width: 60px;
  border: 1px solid rgba(224, 201, 182, 0.2);
  font-weight: 600;
  transition: all 0.2s ease;
}

.corner-cell {
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.15), rgba(201, 168, 135, 0.1));
  position: sticky;
  left: 0;
  top: 0;
  z-index: 3;
  padding: 8px;
}

.corner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.corner-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #a08970;
}

.corner-content svg {
  width: 16px;
  height: 16px;
  color: #c9a887;
}

.header-cell {
  background: linear-gradient(180deg, rgba(224, 201, 182, 0.2), rgba(224, 201, 182, 0.1));
  position: sticky;
  top: 0;
  z-index: 2;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.row-header {
  background: linear-gradient(90deg, rgba(224, 201, 182, 0.2), rgba(224, 201, 182, 0.1));
  position: sticky;
  left: 0;
  z-index: 1;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.node-label {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  font-weight: 600;
}

.matrix-cell {
  background: rgba(255, 255, 255, 0.3);
  position: relative;
}

.matrix-cell:hover {
  background: rgba(243, 232, 221, 0.6);
  transform: scale(1.05);
  box-shadow: 0 0 0 2px rgba(201, 168, 135, 0.3);
  z-index: 1;
}

.matrix-cell.has-value {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));
}

.matrix-cell.diagonal-cell {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.1), rgba(158, 158, 158, 0.05));
}

.matrix-cell.solution-cell {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.15)) !important;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.weight-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.assignment-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assignment-indicator svg {
  width: 12px;
  height: 12px;
  color: white;
}

/* Solution Section */
.solution-section {
  padding: 20px;
  background: rgba(224, 201, 182, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
}

.solution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(224, 201, 182, 0.3);
}

.solution-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #6d5940;
}

.total-cost {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  padding: 8px 16px;
  border-radius: 8px;
}

.cost-label {
  font-size: 13px;
  font-weight: 600;
  color: #6d5940;
}

.cost-value {
  font-size: 18px;
  font-weight: 800;
  color: #4caf50;
  font-family: 'Courier New', monospace;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.assignment-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateX(4px);
}

.assignment-node {
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  min-width: 80px;
  text-align: center;
}

.from-node {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.1));
  color: #1976d2;
}

.to-node {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.1));
  color: #7b1fa2;
}

.assignment-arrow {
  color: #a08970;
}

.assignment-arrow svg {
  width: 20px;
  height: 20px;
}

.assignment-cost {
  margin-left: auto;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  border-radius: 6px;
  font-weight: 700;
  color: #4caf50;
  font-family: 'Courier New', monospace;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 16px;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: #c9b4a4;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #8b7355;
}

.empty-hint {
  font-size: 13px;
  color: #a08970;
  opacity: 0.8;
}

/* Light Theme */
.light-theme .matrix-modal-content {
  background: linear-gradient(180deg, #ffffff 0%, #fdfaf7 100%);
  color: #333;
}

/* Dark Theme */
.dark-theme .matrix-modal-content {
  background: linear-gradient(180deg, #3a3a3a 0%, #2c2c2c 100%);
  color: #e0e0e0;
}

.dark-theme .matrix-modal-header {
  border-bottom-color: rgba(70, 70, 70, 0.4);
}

.dark-theme .matrix-icon {
  background: linear-gradient(135deg, rgba(70, 70, 70, 0.4), rgba(90, 90, 90, 0.3));
  color: #b89570;
}

.dark-theme .close-button {
  background: rgba(70, 70, 70, 0.3);
  color: #c9b4a4;
}

.dark-theme .close-button:hover {
  background: rgba(90, 90, 90, 0.5);
  color: #e0c9b6;
}

.dark-theme .iteration-controls {
  background: rgba(70, 70, 70, 0.3);
  border-color: rgba(70, 70, 70, 0.4);
}

.dark-theme .iteration-counter {
  background: rgba(58, 58, 58, 0.6);
}

.dark-theme .iteration-button {
  background: rgba(70, 70, 70, 0.4);
  border-color: rgba(70, 70, 70, 0.5);
}

.dark-theme .iteration-button:hover:not(:disabled) {
  background: rgba(90, 90, 90, 0.6);
}

.dark-theme .table-container {
  border-color: rgba(70, 70, 70, 0.4);
}

.dark-theme .matrix-table th,
.dark-theme .matrix-table td {
  border-color: rgba(70, 70, 70, 0.4);
}

.dark-theme .corner-cell {
  background: linear-gradient(135deg, rgba(70, 70, 70, 0.4), rgba(90, 90, 90, 0.3));
}

.dark-theme .header-cell {
  background: linear-gradient(180deg, rgba(70, 70, 70, 0.4), rgba(70, 70, 70, 0.3));
}

.dark-theme .row-header {
  background: linear-gradient(90deg, rgba(70, 70, 70, 0.4), rgba(70, 70, 70, 0.3));
}

.dark-theme .node-label {
  background: rgba(58, 58, 58, 0.6);
}

.dark-theme .matrix-cell {
  background: rgba(58, 58, 58, 0.4);
}

.dark-theme .matrix-cell:hover {
  background: rgba(74, 74, 74, 0.6);
}

.dark-theme .solution-section {
  background: rgba(70, 70, 70, 0.3);
  border-color: rgba(70, 70, 70, 0.4);
}

.dark-theme .assignment-item {
  background: rgba(58, 58, 58, 0.6);
}

.dark-theme .assignment-item:hover {
  background: rgba(74, 74, 74, 0.7);
}

/* Scrollbar */
.matrix-modal-body::-webkit-scrollbar,
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.matrix-modal-body::-webkit-scrollbar-track,
.table-container::-webkit-scrollbar-track {
  background: rgba(224, 201, 182, 0.1);
  border-radius: 4px;
}

.matrix-modal-body::-webkit-scrollbar-thumb,
.table-container::-webkit-scrollbar-thumb {
  background: rgba(224, 201, 182, 0.4);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .matrix-modal-content {
    max-width: 95%;
    max-height: 90%;
  }
  
  .assignment-item {
    flex-wrap: wrap;
  }
  
  .assignment-cost {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }
}
</style>