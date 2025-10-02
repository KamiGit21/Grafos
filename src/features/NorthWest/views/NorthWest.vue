<template>
  <Navbar :theme="currentTheme" />
  <div class="northwest-container" :class="currentTheme" style="margin-top: 120px;">
    <Toolbar 
      :current-optimization-mode="optimizationMode" 
      @export-json="exportJSON" 
      @import-json="triggerImportJSON" 
      @solve-minimize="solveMinimize"
      @solve-maximize="solveMaximize"
    />
    
    <main class="main-content">
      <div class="content-grid">
        <MatrixNorthWest
          :sources="sources"
          :destinations="destinations"
          :supply="supply"
          :demand="demand"
          :costs="costs"
          :theme="currentTheme"
          @update-source-name="updateSourceName"
          @update-destination-name="updateDestinationName"
          @update-supply="updateSupply"
          @update-demand="updateDemand"
          @update-cost="updateCost"
          @add-source="addSource"
          @add-destination="addDestination"
          @remove-source="removeSource"
          @remove-destination="removeDestination"
        />
        
        <Iterations
          v-if="result"
          :iterations="result.iteraciones"
          :sources="sources"
          :destinations="destinations"
          :optimization-mode="optimizationMode"
          :theme="currentTheme"
        />
      </div>
    </main>
    
    <button @click="showHelp = true" class="help-button" title="Ayuda" style="bottom: 25px;">
      ?
    </button>
    
    <Help v-if="showHelp" :theme="currentTheme" @close="showHelp = false" />
    
    <input 
      type="file" 
      ref="importFileInput" 
      @change="importJSON" 
      accept=".json" 
      style="display: none;" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import Help from '../../../components/Help.vue';
import Toolbar from '../components/Toolbar.vue';
import MatrixNorthWest from '../components/MatrixNorthWest.vue';
import Iterations from '../components/Iterations.vue';
import { useNorthWestData } from '../composables/useNorthWestData';
import { useNorthWestExport } from '../composables/useNorthWestExport';
import { useNorthWestImport } from '../composables/useNorthWestImport';
import { solveTransportationProblem } from '../utils/NorthWestSolver';

const currentTheme = ref('light-theme');
const showHelp = ref(false);
const optimizationMode = ref('minimize');
const importFileInput = ref(null);
const result = ref(null);

const {
  sources,
  destinations,
  supply,
  demand,
  costs,
  addSource,
  addDestination,
  removeSource,
  removeDestination,
  updateSourceName,
  updateDestinationName,
  updateSupply,
  updateDemand,
  updateCost,
  setSources,
  setDestinations,
  setSupply,
  setDemand,
  setCosts
} = useNorthWestData();

const { exportJSON } = useNorthWestExport(
  sources,
  destinations,
  supply,
  demand,
  costs
);

const { importJSON } = useNorthWestImport(
  importFileInput,
  setSources,
  setDestinations,
  setSupply,
  setDemand,
  setCosts
);

const triggerImportJSON = () => {
  importFileInput.value.click();
};

const solveMinimize = () => {
  try {
    optimizationMode.value = 'minimize';
    result.value = solveTransportationProblem(
      supply.value,
      demand.value,
      costs.value,
      false
    );
  } catch (error) {
    console.error('Error al resolver:', error);
    alert('Error al resolver el problema. Verifica los datos ingresados.');
  }
};

const solveMaximize = () => {
  try {
    optimizationMode.value = 'maximize';
    result.value = solveTransportationProblem(
      supply.value,
      demand.value,
      costs.value,
      true
    );
  } catch (error) {
    console.error('Error al resolver:', error);
    alert('Error al resolver el problema. Verifica los datos ingresados.');
  }
};
</script>

<style scoped>
.northwest-container {
  width: 90vw;
  max-width: 1600px;
  /* aspect-ratio: 16 / 9; */
  display: flex;
  flex-direction: column;
  font-family: 'Oswald', sans-serif;
  transition: background-color 0.3s;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
}

.light-theme {
  background: linear-gradient(135deg, #fdfaf7 0%, #f3e8dd 100%);
  color: #333;
}

.dark-theme {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  color: #e0e0e0;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 0;
}

.content-grid {
  display: grid;
  gap: 30px;
}

.help-button {
  position: fixed;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c9a887, #a08970);
  border: none;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 100;
}

.help-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}
</style>