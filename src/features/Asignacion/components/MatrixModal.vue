<template>
  <div class="matrix-modal-overlay" @click.self="$emit('close')">
    <div :class="['matrix-modal-content', currentTheme]">
      <header class="matrix-modal-header">
        <div class="header-left">
          <div class="matrix-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>Matriz de Asignación</h2>
            <span class="node-count" v-if="nodes.length > 0 && destinations.length > 0">
              {{ optimizationMode === 'minimize' ? 'Minimización' : 'Maximización' }} | 
              {{ nodes.length }} Orígenes × {{ destinations.length }} Destinos
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
        <div v-if="nodes.length > 0 && destinations.length > 0 && assignmentMatrix.length > 0" class="table-container">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="corner-cell">
                  <div class="corner-content">
                    <span class="corner-label">Destino</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="corner-label">Origen</span>
                  </div>
                </th>
                <th v-for="destination in destinations" :key="'h' + destination.id" class="header-cell">
                  <span class="node-label">{{ destination.label || destination.id }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, rowIndex) in nodes" :key="'r' + node.id">
                <th class="row-header">
                  <span class="node-label">{{ node.label || node.id }}</span>
                </th>
                <td 
                  v-for="(weight, colIndex) in assignmentMatrix[rowIndex]" 
                  :key="'c' + destinations[colIndex].id"
                  :class="['matrix-cell', { 
                    'has-edge': weight < 999999 && weight > 0, 
                    'no-connection': weight >= 999999,
                    'zero-cost': weight === 0 && weight < 999999
                  }]"
                >
                  <span class="weight-value">{{ formatValue(weight) }}</span>
                  <div v-if="weight >= 999999" class="no-connection-indicator">∞</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No hay datos para la matriz de asignación</p>
          <span class="empty-hint">Agrega orígenes y destinos con conexiones al grafo</span>
        </div>

        <!-- Información adicional -->
        <div class="matrix-info" v-if="nodes.length > 0 && destinations.length > 0">
          <div class="info-section">
            <h4>Información de la Matriz</h4>
            <div class="info-items">
              <div class="info-item">
                <span class="info-label">Modo:</span>
                <span class="info-value" :class="optimizationMode">{{ 
                  optimizationMode === 'minimize' ? 'Minimización' : 'Maximización' 
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Orígenes:</span>
                <span class="info-value">{{ nodes.length }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Destinos:</span>
                <span class="info-value">{{ destinations.length }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Conexiones válidas:</span>
                <span class="info-value">{{ countValidConnections }}</span>
              </div>
            </div>
          </div>

          <div class="legend-section">
            <div class="legend-title">Leyenda</div>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-square has-edge-square"></div>
                <span>Conexión con costo</span>
              </div>
              <div class="legend-item">
                <div class="legend-square zero-cost-square"></div>
                <span>Costo cero</span>
              </div>
              <div class="legend-item">
                <div class="legend-square no-connection-square"></div>
                <span>Sin conexión (∞)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  nodes: Array,
  destinations: Array,
  assignmentMatrix: Array,
  currentTheme: String,
  optimizationMode: String
});

defineEmits(['close']);

// Contar conexiones válidas
const countValidConnections = computed(() => {
  if (!props.assignmentMatrix.length) return 0;
  let count = 0;
  for (let i = 0; i < props.assignmentMatrix.length; i++) {
    for (let j = 0; j < props.assignmentMatrix[i].length; j++) {
      if (props.assignmentMatrix[i][j] < 999999) {
        count++;
      }
    }
  }
  return count;
});

// Formatear valores
const formatValue = (value) => {
  if (value === undefined || value === null) return '-';
  if (value >= 999999) return '∞';
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.close-button:active {
  transform: rotate(90deg) scale(0.95);
}

.matrix-modal-body {
  padding: 24px;
  overflow: auto;
  flex: 1;
}

.table-container {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
  margin-bottom: 20px;
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

.matrix-cell.has-edge {
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.15), rgba(139, 195, 74, 0.05));
}

.matrix-cell.has-edge:hover {
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.25), rgba(139, 195, 74, 0.15));
}

.matrix-cell.zero-cost {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.05));
}

.matrix-cell.zero-cost:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.25), rgba(33, 150, 243, 0.15));
}

.matrix-cell.no-connection {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.15), rgba(158, 158, 158, 0.05));
  color: #999;
}

.matrix-cell.no-connection:hover {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.25), rgba(158, 158, 158, 0.15));
}

.weight-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.no-connection-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(158, 158, 158, 0.3);
  color: #666;
  border-radius: 4px;
  padding: 1px 4px;
  font-size: 10px;
  font-weight: bold;
}

/* Información adicional */
.matrix-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.info-section {
  padding: 16px;
  background: rgba(224, 201, 182, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(224, 201, 182, 0.1);
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #8b7355;
}

.info-value {
  font-size: 13px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
}

.info-value.minimize {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  color: #4caf50;
}

.info-value.maximize {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 152, 0, 0.1));
  color: #ff9800;
}

/* Legend */
.legend-section {
  padding: 16px;
  background: rgba(224, 201, 182, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.2);
}

.legend-title {
  font-size: 14px;
  font-weight: 700;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6d5940;
}

.legend-square {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.has-edge-square {
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.3), rgba(139, 195, 74, 0.15));
}

.zero-cost-square {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(33, 150, 243, 0.15));
}

.no-connection-square {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.3), rgba(158, 158, 158, 0.15));
}

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

.light-theme .matrix-modal-header {
  border-bottom-color: rgba(224, 201, 182, 0.2);
}

.light-theme .table-container {
  border-color: rgba(224, 201, 182, 0.2);
}

.light-theme .matrix-table th,
.light-theme .matrix-table td {
  border-color: rgba(224, 201, 182, 0.2);
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

.dark-theme .node-count {
  color: #a08970;
}

.dark-theme .close-button {
  background: rgba(70, 70, 70, 0.3);
  color: #c9b4a4;
}

.dark-theme .close-button:hover {
  background: rgba(90, 90, 90, 0.5);
  color: #e0c9b6;
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

.dark-theme .corner-content svg {
  color: #a08970;
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
  box-shadow: 0 0 0 2px rgba(139, 115, 85, 0.4);
}

.dark-theme .matrix-cell.has-edge {
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.2), rgba(139, 195, 74, 0.1));
}

.dark-theme .matrix-cell.has-edge:hover {
  background: linear-gradient(135deg, rgba(139, 195, 74, 0.3), rgba(139, 195, 74, 0.2));
}

.dark-theme .matrix-cell.zero-cost {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.1));
}

.dark-theme .matrix-cell.zero-cost:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(33, 150, 243, 0.2));
}

.dark-theme .matrix-cell.no-connection {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.2), rgba(158, 158, 158, 0.1));
}

.dark-theme .matrix-cell.no-connection:hover {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.3), rgba(158, 158, 158, 0.2));
}

.dark-theme .no-connection-indicator {
  background: rgba(90, 90, 90, 0.5);
  color: #aaa;
}

.dark-theme .info-section,
.dark-theme .legend-section {
  background: rgba(70, 70, 70, 0.3);
  border-color: rgba(70, 70, 70, 0.4);
}

.dark-theme .info-value {
  background: rgba(58, 58, 58, 0.6);
}

.dark-theme .empty-state svg {
  color: #777777;
}

.dark-theme .empty-state p {
  color: #c9b4a4;
}

.dark-theme .empty-hint {
  color: #a08970;
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

.matrix-modal-body::-webkit-scrollbar-thumb:hover,
.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(201, 168, 135, 0.6);
}

.dark-theme .matrix-modal-body::-webkit-scrollbar-track,
.dark-theme .table-container::-webkit-scrollbar-track {
  background: rgba(70, 70, 70, 0.2);
}

.dark-theme .matrix-modal-body::-webkit-scrollbar-thumb,
.dark-theme .table-container::-webkit-scrollbar-thumb {
  background: rgba(70, 70, 70, 0.6);
}

.dark-theme .matrix-modal-body::-webkit-scrollbar-thumb:hover,
.dark-theme .table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(90, 90, 90, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .matrix-modal-content {
    max-width: 95%;
    max-height: 90%;
  }
  
  .matrix-modal-header {
    padding: 16px 20px;
  }
  
  .matrix-modal-header h2 {
    font-size: 1.2rem;
  }
  
  .matrix-icon {
    width: 32px;
    height: 32px;
  }
  
  .matrix-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .matrix-table th,
  .matrix-table td {
    padding: 8px 12px;
    min-width: 50px;
    font-size: 12px;
  }
  
  .node-label {
    padding: 3px 6px;
    font-size: 11px;
  }
  
  .matrix-info {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>