<template>
  <div class="selector-modal-overlay" @click.self="closeModal">
    <div :class="['selector-modal-content', theme]">
      <header class="selector-modal-header">
        <h2>Seleccionar Algoritmo</h2>
        <button class="close-button" @click="closeModal" title="Cerrar">
          ×
        </button>
      </header>

      <main class="selector-modal-body">
        <div class="algorithm-option">
          <button
            @click="showJohnsonOptions = !showJohnsonOptions"
            class="select-button"
          >
            Algoritmo de Johnson {{ showJohnsonOptions ? "▲" : "▼" }}
          </button>
          <div v-if="showJohnsonOptions" class="sub-options">
            <button @click="selectJohnson('max')" class="sub-option-button">
              Maximizar
            </button>
            <button @click="selectJohnson('min')" class="sub-option-button">
              Minimizar
            </button>
          </div>
        </div>
        <!-- Algoritmo de Asignacion, p/ mostrar opciones de Maximizar y Minimizar-->
        <div class="algorithm-option">
          <button
            @click="showAsignacionOptions = !showAsignacionOptions"
            class="select-button"
          >
            Algoritmo de Asignacion {{ showAsignacionOptions ? "▲" : "▼" }}
          </button>
          <div v-if="showAsignacionOptions" class="sub-options">
            <button @click="selectAsignacion('max')" class="sub-option-button">
              Maximizar
            </button>
            <button @click="selectAsignacion('min')" class="sub-option-button">
              Minimizar
            </button>
          </div>
        </div>
        <button @click="selectOther" class="select-button">Otra Opción</button>
      </main>
    </div>

    <Johnson
      v-if="showJohnson === 'max'"
      :nodes="nodes"
      :edges="edges"
      :theme="theme"
      @close="showJohnson = null"
      @update-graph="$emit('update-graph', $event)"
      @clear-graph="$emit('clear-graph')"
    />
    <JohnsonMin
      v-if="showJohnson === 'min'"
      :nodes="nodes"
      :edges="edges"
      :theme="theme"
      @close="showJohnson = null"
      @update-graph="$emit('update-graph', $event)"
      @clear-graph="$emit('clear-graph')"
    />

    <AsignacionMax
      v-if="showAsignacion === 'max'"
      :nodes="nodes"
      :adjacencyMatrix="adjacencyMatrix"
      :theme="theme"
      @close="showAsignacion = null"
      @update-graph="$emit('update-graph', $event)"
      @clear-graph="$emit('clear-graph')"
    />

    <AsignacionMin
      v-if="showAsignacion === 'min'"
      :nodes="nodes"
      :adjacencyMatrix="adjacencyMatrix"
      :theme="theme"
      @close="showAsignacion = null"
      @update-graph="$emit('update-graph', $event)"
      @clear-graph="$emit('clear-graph')"
    />

  </div>


</template>

<script setup>
import { ref } from "vue";

import Johnson from "./Johnson.vue";
import JohnsonMin from "./JohnsonMin.vue";

import AsignacionMax from "./AsignacionMax.vue";
import AsignacionMin from "./AsignacionMin.vue";

const emit = defineEmits(["close", "update-graph", "clear-graph"]);

const props = defineProps({
  theme: {
    type: String,
    default: "light-theme",
  },
  nodes: {
    type: Array,
    required: true,
  },
  edges: {
    type: Array,
    required: true,
  },
});

const showJohnson = ref(null);
const showJohnsonOptions = ref(false);

const showAsignacion = ref(null);
const showAsignacionOptions = ref(false);

const selectJohnson = (type) => {
  showJohnson.value = type;
  showJohnsonOptions.value = false;
};

const selectAsignacion = (type) => {
  showAsignacion.value = type;
  showAsignacionOptions.value = false;
};

const selectOther = () => {
  alert("Próximamente");
};

const closeModal = () => {
  showJohnson.value = null;
  showAsignacion.value = null;
  emit("close");
};
</script>

<style scoped>
.selector-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.selector-modal-content {
  width: 50%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.selector-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  flex-shrink: 0;
  border-bottom: 1px solid;
}

.selector-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}

.selector-modal-body {
  padding: 20px;
  text-align: center;
}

.algorithm-option {
  margin-bottom: 15px;
}

.select-button {
  display: block;
  width: 80%;
  margin: 10px auto;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.sub-options {
  width: 80%;
  margin: 5px auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sub-option-button {
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

/* Theme styles */
.light-theme {
  background-color: #f9f9f9;
  color: #333;
}
.light-theme .selector-modal-header {
  border-bottom-color: #e0e0e0;
}
.light-theme .close-button {
  color: #888;
}
.light-theme .close-button:hover {
  color: #000;
}
.light-theme .select-button,
.light-theme .sub-option-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;
}
.light-theme .select-button:hover,
.light-theme .sub-option-button:hover {
  background-color: #e0e0e0;
}

.dark-theme {
  background-color: #3a3a3a;
  color: #e0e0e0;
}
.dark-theme .selector-modal-header {
  border-bottom-color: #555;
}
.dark-theme .close-button {
  color: #bbb;
}
.dark-theme .close-button:hover {
  color: #fff;
}
.dark-theme .select-button,
.dark-theme .sub-option-button {
  background-color: #4f4f4f;
  border: 1px solid #666;
  color: #e0e0e0;
}
.dark-theme .select-button:hover,
.dark-theme .sub-option-button:hover {
  background-color: #5a5a5a;
}
</style>
