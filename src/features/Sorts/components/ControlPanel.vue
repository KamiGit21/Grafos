<template>
  <div class="control-panel">
    <div class="manual-section">
      <h3>Control de Ordenamiento</h3>
      
      <!-- Sección de entrada manual -->
      <div class="input-section">
        <h4>Entrada Manual</h4>
        <div class="manual-input-group">
          <textarea 
            v-model="manualInput" 
            placeholder="Ingresa números separados por comas (ej: 64, 33, 229, 261)"
            rows="3"
            class="manual-textarea"
          ></textarea>
          <button @click="submitManualInput" class="action-btn manual-submit-btn" :disabled="!manualInput.trim()">
            Cargar Manualmente
          </button>
        </div>
      </div>
      
      <!-- Separador -->
      <div class="section-divider">O</div>
      
      <!-- Sección de generación automática -->
      <div class="input-section">
        <h4>Generación Automática</h4>
        <div class="controls-grid">
          <div class="control-group">
            <label>Cantidad:</label>
            <div class="input-group">
              <input type="number" v-model.number="localSize" min="1" @input="handleSizeInput" placeholder="">
              <span class="value-display">{{ localSize || '-' }}</span>
            </div>
          </div>
          
          <div class="control-group">
            <label>Mínimo:</label>
            <div class="input-group">
              <input type="number" v-model.number="localMin" @input="handleMinInput" placeholder="">
              <span class="value-display">{{ localMin || '-' }}</span>
            </div>
          </div>
          
          <div class="control-group">
            <label>Máximo:</label>
            <div class="input-group">
              <input type="number" v-model.number="localMax" @input="handleMaxInput" placeholder="">
              <span class="value-display">{{ localMax || '-' }}</span>
            </div>
          </div>
        </div>
        
        <button @click="generateRandom" class="action-btn generate-btn full-width">
          Generar Array Aleatorio
        </button>
        <button @click="generateWithParams" class="action-btn generate-params-btn full-width" :disabled="!hasAllParams">
          Generar con Parámetros
        </button>
      </div>
      
      <!-- Selección de algoritmo -->
      <div class="algorithm-selection">
        <label>Algoritmo:</label>
        <div class="algorithm-buttons">
          <!--<button 
            @click="selectAlgorithm('bubble')" 
            :class="['algorithm-btn', { 'active': selectedAlgorithm === 'bubble' }]"
          >
            Bubble Sort
          </button>
          -->
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

          <button 
            @click="selectAlgorithm('shell')" 
            :class="['algorithm-btn', { 'active': selectedAlgorithm === 'shell' }]"
          >
            Shell Sort
          </button>
          <button 
            @click="selectAlgorithm('merge')" 
            :class="['algorithm-btn', { 'active': selectedAlgorithm === 'merge' }]"
          >
            Merge Sort
          </button>
        </div>
      </div>
      
      <!-- Selección de dirección -->
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
      
      <!-- Botones de acción principales -->
      <div class="action-buttons">
        <button @click="sort" class="action-btn sort-btn" :disabled="!hasData || (isSorting && !isPaused)">Ordenar</button>
        <button @click="importData" class="action-btn import-btn">Importar JSON</button>
        <button @click="exportData" class="action-btn export-btn" :disabled="!hasData">Exportar JSON</button>
      </div>
      
      <!-- Display del timer -->
      <div class="timer-display">
        <div class="timer-label">Tiempo de Ejecución:</div>
        <div class="timer-value">{{ elapsedTime.toFixed(2) }} segundos</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, computed, watch } from 'vue';

// =============================================
// CONFIGURACIÓN DE PROPS Y EMITS
// =============================================

/**
 * Emits para comunicación con el componente padre
 */
const emit = defineEmits(['generate', 'manual-input', 'sort', 'import', 'export', 'algorithm-change', 'direction-change']);

/**
 * Props recibidos del componente padre
 */
const props = defineProps({
  isSorting: Boolean,                    // Estado del ordenamiento
  isPaused: Boolean,                     // Estado de pausa
  elapsedTime: Number,                   // Tiempo transcurrido
  currentArray: {                        // Array actual
    type: Array,
    default: () => []
  },
  arrayParams: {                         // Parámetros del array
    type: Object,
    default: () => ({ size: '', min: '', max: '' })
  }
});

// =============================================
// ESTADOS REACTIVOS LOCALES
// =============================================

// Entrada manual del usuario
const manualInput = ref('');

// Parámetros locales para generación automática
const localSize = ref('');      // Cantidad de elementos
const localMin = ref('');       // Valor mínimo
const localMax = ref('');       // Valor máximo

// Configuración del algoritmo
const selectedAlgorithm = ref('bubble');  // Algoritmo seleccionado
const sortDirection = ref(true);          // Dirección del ordenamiento

// =============================================
// COMPUTED PROPERTIES
// =============================================

/**
 * Verifica si hay datos para mostrar/exportar
 */
const hasData = computed(() => {
  return props.currentArray && props.currentArray.length > 0;
});

/**
 * Verifica si todos los parámetros están completos
 */
const hasAllParams = computed(() => {
  return localSize.value !== '' && localMin.value !== '' && localMax.value !== '';
});

// =============================================
// MANEJADORES DE ENTRADA DE DATOS
// =============================================

/**
 * Valida y ajusta el valor de tamaño
 */
const handleSizeInput = () => {
  if (localSize.value === '') return;
  // 🔄 MODIFICACIÓN: Solo validar que sea al menos 1 elemento
  if (localSize.value < 1) localSize.value = 1;
};

/**
 * Valida y ajusta el valor mínimo
 */
const handleMinInput = () => {
  if (localMin.value === '') return;
  // No permitir valores negativos
  if (localMin.value < 0) localMin.value = 0;
  // Asegurar que mínimo sea menor que máximo
  if (localMax.value !== '' && localMin.value >= localMax.value) {
    localMax.value = localMin.value + 1;
  }
};

/**
 * Valida y ajusta el valor máximo
 */
const handleMaxInput = () => {
  if (localMax.value === '') return;
  // Mínimo valor permitido es 1
  if (localMax.value < 1) localMax.value = 1;
  // Asegurar que máximo sea mayor que mínimo
  if (localMin.value !== '' && localMax.value <= localMin.value) {
    localMin.value = localMax.value - 1;
  }
};

// =============================================
// FUNCIONES PRINCIPALES
// =============================================

/**
 * Procesa y valida la entrada manual de números
 */
const submitManualInput = () => {
  if (!manualInput.value.trim()) {
    alert('Por favor ingresa algunos números');
    return;
  }

  try {
    // Convertir texto a array de números
    const numbers = manualInput.value.split(',')
      .map(num => num.trim())
      .filter(num => num !== '')
      .map(num => {
        const parsed = Number(num);
        if (isNaN(parsed)) {
          throw new Error(`"${num}" no es un número válido`);
        }
        return parsed;
      });

    // Validaciones
    if (numbers.length === 0) {
      alert('No se encontraron números válidos en la entrada');
      return;
    }

    // 🔄 MODIFICACIÓN: Eliminada la validación de máximo 30 elementos
    // if (numbers.length > 30) {
    //   alert('El array no puede tener más de 30 elementos');
    //   return;
    // }

    // Emitir array validado al padre
    emit('manual-input', numbers);
    
    // Limpiar el textarea
    manualInput.value = '';
    
  } catch (error) {
    alert(`Error en la entrada: ${error.message}`);
  }
};

/**
 * Genera array completamente aleatorio (sin parámetros)
 */
const generateRandom = () => {
  // Limpiar campos locales
  localSize.value = '';
  localMin.value = '';
  localMax.value = '';
  
  // Emitir evento de generación aleatoria
  emit('generate', '', '', '');
};

/**
 * Genera array con parámetros específicos
 */
const generateWithParams = () => {
  if (!hasAllParams.value) {
    alert('Para generar con parámetros, debes especificar Cantidad, Mínimo y Máximo');
    return;
  }
  
  emit('generate', localSize.value, localMin.value, localMax.value);
};

/**
 * Inicia el proceso de ordenamiento
 */
const sort = () => {
  emit('sort');
};

/**
 * Solicita importar datos desde JSON
 */
const importData = () => {
  emit('import');
};

/**
 * Solicita exportar datos a JSON con nombre personalizado
 */
const exportData = () => {
  emit('export');
};

/**
 * Cambia el algoritmo de ordenamiento
 * @param {string} algorithm - Nombre del algoritmo
 */
const selectAlgorithm = (algorithm) => {
  selectedAlgorithm.value = algorithm;
  emit('algorithm-change', algorithm);
};

/**
 * Cambia la dirección del ordenamiento
 * @param {boolean} direction - true para ascendente, false para descendente
 */
const selectDirection = (direction) => {
  sortDirection.value = direction;
  emit('direction-change', direction);
};

// =============================================
// WATCHERS PARA SINCRONIZACIÓN
// =============================================

/**
 * Sincroniza parámetros locales con los props del padre
 */
watch(() => props.arrayParams, (newParams) => {
  localSize.value = newParams.size;
  localMin.value = newParams.min;
  localMax.value = newParams.max;
}, { immediate: true, deep: true });

/**
 * Limpia campos cuando no hay array
 */
watch(() => props.currentArray, (newArray) => {
  if (!newArray || newArray.length === 0) {
    localSize.value = '';
    localMin.value = '';
    localMax.value = '';
  }
});
</script>

<style scoped>
/* Estilos permanecen iguales */
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

.input-section {
  margin-bottom: 20px;
}

.input-section h4 {
  margin: 0 0 12px 0;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.manual-input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.manual-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid v-bind('theme === "light-theme" ? "#ccc" : "#666"');
  background-color: v-bind('theme === "light-theme" ? "#fff" : "#444"');
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
  transition: all 0.2s ease;
}

.manual-textarea:focus {
  outline: none;
  border-color: v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  box-shadow: 0 0 0 2px v-bind('theme === "light-theme" ? "rgba(74, 144, 226, 0.2)" : "rgba(106, 180, 255, 0.2)"');
}

.manual-submit-btn {
  background: linear-gradient(135deg, #805ad5, #6b46c1);
}

.section-divider {
  text-align: center;
  margin: 20px 0;
  color: v-bind('theme === "light-theme" ? "#666" : "#999"');
  font-weight: 500;
  position: relative;
}

.section-divider::before,
.section-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: v-bind('theme === "light-theme" ? "#ddd" : "#555"');
}

.section-divider::before {
  left: 0;
}

.section-divider::after {
  right: 0;
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
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

.input-group input::placeholder {
  color: v-bind('theme === "light-theme" ? "#999" : "#777"');
  font-size: 0.8rem;
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

.full-width {
  width: 100%;
  margin-bottom: 8px;
}

.generate-btn {
  background: linear-gradient(135deg, #38a169, #2f855a);
}

.generate-params-btn {
  background: linear-gradient(135deg, #3182ce, #2c5aa0);
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