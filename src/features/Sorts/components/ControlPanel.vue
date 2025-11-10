<template>
  <div class="control-panel" :class="theme">
    <div class="panel-header" :class="theme">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V4M12 4L10 6M12 4L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 18V20M12 20L10 18M12 20L14 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M7 12H9M15 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>Control de Ordenamiento</h3>
    </div>
    
    <!-- Sección de entrada manual -->
    <div class="input-section">
      <div class="section-title">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h4>Entrada Manual</h4>
      </div>
      <div class="manual-input-group">
        <textarea 
          v-model="manualInput" 
          placeholder="Ingresa números separados por comas (ej: 64, 33, 229, 261)"
          rows="3"
          class="manual-textarea"
        ></textarea>
        <button @click="submitManualInput" class="action-btn manual-submit-btn" :disabled="!manualInput.trim()">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Cargar Manualmente
        </button>
      </div>
    </div>
    
    <!-- Separador -->
    <div class="section-divider">
      <span>O</span>
    </div>
    
    <!-- Sección de generación automática -->
    <div class="input-section">
      <div class="section-title">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h4>Generación Automática</h4>
      </div>
      <div class="controls-grid">
        <div class="control-group">
          <label>Cantidad:</label>
          <div class="input-wrapper">
            <input type="number" v-model.number="localSize" min="1" @input="handleSizeInput" placeholder="10">
            <span class="value-display">{{ localSize || '0' }}</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>Mínimo:</label>
          <div class="input-wrapper">
            <input type="number" v-model.number="localMin" @input="handleMinInput" placeholder="1">
            <span class="value-display">{{ localMin || '0' }}</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>Máximo:</label>
          <div class="input-wrapper">
            <input type="number" v-model.number="localMax" @input="handleMaxInput" placeholder="100">
            <span class="value-display">{{ localMax || '0' }}</span>
          </div>
        </div>
      </div>
      
      <div class="generation-buttons">
        <button @click="generateRandom" class="action-btn generate-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Generar Aleatorio
        </button>
        <button @click="generateWithParams" class="action-btn generate-params-btn" :disabled="!hasAllParams">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Con Parámetros
        </button>
      </div>
    </div>
    
    <!-- Selección de algoritmo -->
    <div class="selection-section">
      <div class="section-title">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h4>Algoritmo</h4>
      </div>
      <div class="algorithm-buttons">
        <button 
          @click="selectAlgorithm('selection')" 
          :class="['selection-btn', { 'active': selectedAlgorithm === 'selection' }]"
        >
          Selection Sort
        </button>
        <button 
          @click="selectAlgorithm('insertion')" 
          :class="['selection-btn', { 'active': selectedAlgorithm === 'insertion' }]"
        >
          Insertion Sort
        </button>
        <button 
          @click="selectAlgorithm('shell')" 
          :class="['selection-btn', { 'active': selectedAlgorithm === 'shell' }]"
        >
          Shell Sort
        </button>
        <button 
          @click="selectAlgorithm('merge')" 
          :class="['selection-btn', { 'active': selectedAlgorithm === 'merge' }]"
        >
          Merge Sort
        </button>
      </div>
    </div>
    
    <!-- Selección de dirección -->
    <div class="selection-section">
      <div class="section-title">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h4>Dirección</h4>
      </div>
      <div class="direction-buttons">
        <button 
          @click="selectDirection(true)" 
          :class="['selection-btn direction-btn', { 'active': sortDirection === true }]"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Ascendente
        </button>
        <button 
          @click="selectDirection(false)" 
          :class="['selection-btn direction-btn', { 'active': sortDirection === false }]"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Descendente
        </button>
      </div>
    </div>
    
    <!-- Botones de acción principales -->
    <div class="action-buttons">
      <button @click="sort" class="action-btn sort-btn" :disabled="!hasData || (isSorting && !isPaused)">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Ordenar
      </button>
      <button @click="importData" class="action-btn import-btn">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Importar
      </button>
      <button @click="exportData" class="action-btn export-btn" :disabled="!hasData">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 8L12 3L7 8M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Exportar
      </button>
    </div>
    
    <!-- Display del timer -->
    <div class="timer-display">
      <div class="timer-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="13" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V13L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="timer-content">
        <div class="timer-label">Tiempo de Ejecución</div>
        <div class="timer-value">{{ elapsedTime.toFixed(3) }}s</div>
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

<style>
.control-panel {
  background: linear-gradient(180deg, rgba(255, 249, 242, 0.95) 0%, rgba(248, 238, 226, 0.9) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid rgba(224, 201, 182, 0.4);
  box-shadow: 0 8px 32px rgba(139, 115, 85, 0.12);
  backdrop-filter: blur(12px);
  height: fit-content;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(224, 201, 182, 0.3);
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.3), rgba(201, 168, 135, 0.2));
  border-radius: 12px;
  color: #c9a887;
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
}

.input-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title svg {
  width: 18px;
  height: 18px;
  color: #c9a887;
}

.section-title h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #8b7355;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.manual-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manual-textarea {
  padding: 12px;
  border-radius: 8px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  background: rgba(255, 255, 255, 0.7);
  color: #333;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 70px;
  transition: all 0.3s ease;
}

.manual-textarea:focus {
  outline: none;
  border-color: rgba(201, 168, 135, 0.6);
  box-shadow: 0 0 0 3px rgba(201, 168, 135, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

.manual-textarea::placeholder {
  color: rgba(139, 115, 85, 0.5);
}

.section-divider {
  text-align: center;
  margin: 24px 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(224, 201, 182, 0.5), transparent);
}

.section-divider span {
  padding: 0 16px;
  color: #a08970;
  font-weight: 600;
  font-size: 0.9rem;
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.2), rgba(201, 168, 135, 0.1));
  border-radius: 20px;
  border: 1px solid rgba(224, 201, 182, 0.3);
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.control-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(224, 201, 182, 0.2);
  transition: all 0.2s ease;
}

.control-group:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(224, 201, 182, 0.4);
}

.control-group label {
  font-weight: 600;
  color: #8b7355;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-wrapper input {
  width: 70px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  text-align: center;
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: rgba(201, 168, 135, 0.6);
  box-shadow: 0 0 0 3px rgba(201, 168, 135, 0.1);
}

.input-wrapper input::placeholder {
  color: rgba(139, 115, 85, 0.4);
  font-weight: 400;
}

.value-display {
  font-weight: 700;
  color: #c9a887;
  min-width: 30px;
  text-align: center;
  font-size: 1rem;
  font-family: 'Oswald', sans-serif;
}

.generation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.selection-section {
  margin-bottom: 24px;
}

.algorithm-buttons,
.direction-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selection-btn {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(224, 201, 182, 0.3);
  color: #8b7355;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
}

.selection-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(201, 168, 135, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.5s ease, height 0.5s ease;
}

.selection-btn:hover::before {
  width: 300px;
  height: 300px;
}

.selection-btn:hover {
  background: rgba(243, 232, 221, 0.8);
  border-color: rgba(201, 168, 135, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
}

.selection-btn.active {
  background: linear-gradient(135deg, #e0c9b6 0%, #d4baaa 100%);
  border-color: #c9b4a4;
  color: #5a4638;
  box-shadow: 
    0 4px 12px rgba(139, 115, 85, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  transform: translateY(0);
}

.direction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.direction-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.direction-btn:hover svg {
  transform: scale(1.2);
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 14px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  color: white;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.action-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.action-btn:hover:not(:disabled) svg {
  transform: scale(1.1) rotate(5deg);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover:not(:disabled)::before {
  left: 100%;
}

.manual-submit-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.manual-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

.generate-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.generate-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

.generate-params-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.generate-params-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 213, 166, 0.3);
}

.sort-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.sort-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 213, 166, 0.3);
}

.import-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.import-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 213, 166, 0.3);
}

.export-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.export-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 213, 166, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: grayscale(0.3);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(224, 201, 182, 0.2), rgba(201, 168, 135, 0.1));
  border-radius: 12px;
  border: 2px solid rgba(224, 201, 182, 0.3);
}

.timer-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201, 168, 135, 0.2);
  border-radius: 10px;
  color: #c9a887;
}

.timer-icon svg {
  width: 24px;
  height: 24px;
}

.timer-content {
  flex: 1;
}

.timer-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #a08970;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #8b7355;
  font-family: 'Oswald', sans-serif;
  letter-spacing: 0.5px;
}

.dark-theme .control-panel{
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(35, 35, 35, 0.9) 100%);
  border-color: rgba(70, 70, 70, 0.5);
}
.dark-theme .panel-header {
  border-bottom-color: rgba(70, 70, 70, 0.4);
}

  .header-icon {
    background: linear-gradient(135deg, rgba(70, 70, 70, 0.4), rgba(90, 90, 90, 0.3));
    color: #b89570;
  }

  .dark-theme .manual-textarea,
  .dark-theme .input-wrapper input {
    background: rgba(58, 58, 58, 0.7);
    border-color: rgba(70, 70, 70, 0.5);
    color: #e0e0e0;
  }

  .dark-theme .manual-textarea:focus,
  .dark-theme .input-wrapper input:focus {
    border-color: rgba(139, 115, 85, 0.6);
    box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
    background: rgba(58, 58, 58, 0.9);
  }

  .dark-theme .control-group {
    background: rgba(58, 58, 58, 0.5);
    border-color: rgba(70, 70, 70, 0.3);
  }

  .dark-theme .control-group:hover {
    background: rgba(58, 58, 58, 0.7);
    border-color: rgba(70, 70, 70, 0.5);
  }

  .dark-theme .selection-btn {
    background: rgba(58, 58, 58, 0.6);
    border-color: rgba(70, 70, 70, 0.5);
    color: #c9b4a4;
  }

  .dark-theme .selection-btn:hover {
    background: rgba(74, 74, 74, 0.8);
    border-color: rgba(139, 115, 85, 0.5);
  }

  .dark-theme .selection-btn.active {
    background: linear-gradient(135deg, #666565 0%, #555555 100%);
    border-color: #777777;
    color: #f5e6d3;
  }

  .dark-theme .timer-display {
    background: linear-gradient(135deg, rgba(70, 70, 70, 0.3), rgba(90, 90, 90, 0.2));
    border-color: rgba(70, 70, 70, 0.5);
  }

  .dark-theme .timer-icon {
    background: rgba(90, 90, 90, 0.4);
    color: #a08970;
  }

  .dark-theme .timer-value {
    color: #c9b4a4;
  }

</style>