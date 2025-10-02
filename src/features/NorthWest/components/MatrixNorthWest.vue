<template>
  <div :class="['matrix-editor', theme]">
    <div class="matrix-header">
      <div class="header-left">
        <div class="matrix-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>Configuración de la Matriz de Transporte</h3>
      </div>
      <div class="matrix-actions">
        <button @click="$emit('add-source')" class="btn-add">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Origen
        </button>
        <button @click="$emit('add-destination')" class="btn-add">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Destino
        </button>
      </div>
    </div>
    
    <div class="table-wrapper">
      <table class="transport-table">
        <thead>
          <tr>
            <th class="corner-cell">
              <div class="corner-content">
                <span class="corner-label">Destino</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="corner-label">Origen</span>
              </div>
            </th>
            <th 
              v-for="(dest, idx) in destinations" 
              :key="'dest-' + idx" 
              class="dest-header"
            >
              <div class="header-cell-content">
                <input
                  type="text"
                  :value="dest"
                  @input="$emit('update-destination-name', idx, $event.target.value)"
                  class="name-input"
                  placeholder="Destino"
                />
                <button 
                  v-if="destinations.length > 1"
                  @click="$emit('remove-destination', idx)" 
                  class="btn-remove"
                  title="Eliminar destino"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </th>
            <th class="supply-header">Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(source, i) in sources" :key="'source-' + i">
            <th class="source-header">
              <div class="header-cell-content">
                <input
                  type="text"
                  :value="source"
                  @input="$emit('update-source-name', i, $event.target.value)"
                  class="name-input"
                  placeholder="Origen"
                />
                <button 
                  v-if="sources.length > 1"
                  @click="$emit('remove-source', i)" 
                  class="btn-remove"
                  title="Eliminar origen"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </th>
            <td 
              v-for="(dest, j) in destinations" 
              :key="'cost-' + i + '-' + j" 
              class="cost-cell"
            >
              <input
                type="number"
                :value="costs[i][j]"
                @input="$event.target.value = Math.max(0, $event.target.value); $emit('update-cost', i, j, $event.target.value)"
                class="cost-input"
                min="0"
                step="0.01"
              />
            </td>
            <td class="supply-cell">
              <input
                type="number"
                :value="supply[i]"
                @input="$event.target.value = Math.max(0, $event.target.value); $emit('update-supply', i, $event.target.value)"
                class="supply-input"
                min="0"
                step="0.01"
              />
            </td>
          </tr>
          <tr class="demand-row">
            <th class="demand-header">Demanda</th>
            <td 
              v-for="(dem, j) in demand" 
              :key="'demand-' + j" 
              class="demand-cell"
            >
              <input
                type="number"
                :value="dem"
                @input="$event.target.value = Math.max(0, $event.target.value); $emit('update-demand', j, $event.target.value)"
                class="demand-input"
                min="0"
                step="0.01"
              />
            </td>
            <td class="total-cell">
              <div class="totals">
                <span class="total-label">Oferta: <strong>{{ totalSupply }}</strong></span>
                <span class="total-label">Demanda: <strong>{{ totalDemand }}</strong></span>
                <span 
                  :class="['balance-indicator', isBalanced ? 'balanced' : 'unbalanced']"
                >
                  {{ isBalanced ? '✓ Balanceado' : '⚠ Desbalanceado' }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  sources: Array,
  destinations: Array,
  supply: Array,
  demand: Array,
  costs: Array,
  theme: String
});

defineEmits([
  'update-source-name',
  'update-destination-name',
  'update-supply',
  'update-demand',
  'update-cost',
  'add-source',
  'add-destination',
  'remove-source',
  'remove-destination'
]);

const totalSupply = computed(() => {
  return props.supply.reduce((a, b) => a + b, 0).toFixed(2);
});

const totalDemand = computed(() => {
  return props.demand.reduce((a, b) => a + b, 0).toFixed(2);
});

const isBalanced = computed(() => {
  return Math.abs(parseFloat(totalSupply.value) - parseFloat(totalDemand.value)) < 0.01;
});
</script>

<style scoped>

.matrix-editor {
  background: rgba(255, 255, 255, 1);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(224, 201, 182, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
}

.dark-theme .matrix-editor {
  background: rgba(58, 58, 58, 1);
  border-color: rgba(70, 70, 70, 1);
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(224, 201, 182, 0.3);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.matrix-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.3), rgba(201, 168, 135, 0.2));
  border-radius: 10px;
  color: #c9a887;
  flex-shrink: 0;
}

.matrix-icon svg {
  width: 22px;
  height: 22px;
}

.matrix-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #8b7355;
}

.dark-theme .matrix-header h3 {
  color: #c9b4a4;
}

.matrix-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #c9a887, #a08970);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 168, 135, 0.4);
}

.table-wrapper {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(224, 201, 182, 0.3);
  flex: 1;
  min-height: 0;
}

.transport-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.transport-table th,
.transport-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid rgba(224, 201, 182, 0.2);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.transport-table th {
  min-width: 120px;
  max-width: 150px;
}

.transport-table td {
  min-width: 100px;
  max-width: 120px;
}

/* Reduce sizes when there are more columns/rows */
.transport-table:has(thead th:nth-child(5)) th,
.transport-table:has(thead th:nth-child(5)) td {
  min-width: 90px;
  max-width: 110px;
  padding: 6px;
  font-size: 13px;
}

.transport-table:has(thead th:nth-child(7)) th,
.transport-table:has(thead th:nth-child(7)) td {
  min-width: 80px;
  max-width: 100px;
  padding: 5px;
  font-size: 12px;
}

.transport-table:has(thead th:nth-child(9)) th,
.transport-table:has(thead th:nth-child(9)) td {
  min-width: 70px;
  max-width: 90px;
  padding: 4px;
  font-size: 11px;
}

.corner-cell {
  background: #d4baa5;
  position: sticky;
  left: 0;
  z-index: 3;
}

.dark-theme .corner-cell {
  background: #333;
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

.dest-header,
.supply-header {
  background: #e0c9b6;
  font-weight: 600;
  color: #5d4a36;
  position: sticky;
  top: 0;
  z-index: 2;
}

.source-header,
.demand-header {
  background: #e0c9b6;
  font-weight: 600;
  color: #5d4a36;
  position: sticky;
  left: 0;
  z-index: 1;
}

.header-cell-content {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.name-input {
  padding: 6px 10px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 13px;
  color: #6d5940;
  text-align: center;
  width: 100%;
  max-width: 140px;
  transition: all 0.2s ease;
}

/* Adjust input size based on table size */
.transport-table:has(thead th:nth-child(5)) .name-input {
  max-width: 100px;
  font-size: 12px;
}

.transport-table:has(thead th:nth-child(7)) .name-input {
  max-width: 80px;
  font-size: 11px;
}

.transport-table:has(thead th:nth-child(9)) .name-input {
  max-width: 70px;
  font-size: 10px;
}

.name-input:focus {
  outline: none;
  border-color: #c9a887;
  background: white;
  box-shadow: 0 0 0 3px rgba(201, 168, 135, 0.2);
}

.cost-input,
.supply-input,
.demand-input {
  width: 70%;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 12px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  color: #6d5940;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
}

.cost-input:focus,
.supply-input:focus,
.demand-input:focus {
  outline: none;
  border-color: #c9a887;
  background: white;
  box-shadow: 0 0 0 3px rgba(201, 168, 135, 0.2);
}

.cost-cell {
  background: rgba(33, 150, 243, 0.05);
}

.supply-cell {
  background: rgba(76, 175, 80, 0.08);
}

.demand-cell {
  background: rgba(156, 39, 176, 0.08);
}

.total-cell {
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.2), rgba(201, 168, 135, 0.15));
  font-weight: 600;
}

.totals {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
}

.total-label {
  font-size: 12px;
  color: #8b7355;
}

.balance-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balanced {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.unbalanced {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.btn-remove {
  width: 26px;
  height: 26px;
  padding: 0;
  background: rgba(244, 67, 54, 0.15);
  border: none;
  border-radius: 50%;
  color: #f44336;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-remove svg {
  width: 12px;
  height: 12px;
  stroke-width: 2.5;
}

.btn-remove:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: rotate(90deg);
}

/* Dark Theme */
.dark-theme .name-input,
.dark-theme .cost-input,
.dark-theme .supply-input,
.dark-theme .demand-input {
  background: rgba(58, 58, 58, 0.8);
  border-color: rgba(70, 70, 70, 0.5);
  color: #e0c9b6;
}

.dark-theme .name-input:focus,
.dark-theme .cost-input:focus,
.dark-theme .supply-input:focus,
.dark-theme .demand-input:focus {
  background: rgba(74, 74, 74, 0.9);
  border-color: #b89570;
}

.dark-theme .dest-header,
.dark-theme .supply-header {
  background: linear-gradient(180deg, rgba(70, 70, 70, 1), rgba(70, 70, 70, 1));
  color: #c9b4a4;
}

.dark-theme .source-header,
.dark-theme .demand-header {
  background: linear-gradient(90deg, rgba(70, 70, 70, 1), rgba(70, 70, 70, 1));
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