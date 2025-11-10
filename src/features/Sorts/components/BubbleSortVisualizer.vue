<template>
  <div class="sorts-container" :class="theme">
    <Navbar/>
       
    <div class="sorts-content">
      <header class="sorts-header">
        <div class="header-content">
          <h1>ALGORITMOS DE ORDENAMIENTO</h1>
        </div>
      </header>

      <main class="sorts-main">
        <!-- Panel lateral de control -->
        <aside class="control-sidebar">
          <ControlPanel 
            @generate="generateArray"
            @manual-input="handleManualInput"
            @sort="startSort"
            @import="importArray"
            @export="exportArray"
            @algorithm-change="changeAlgorithm"
            @direction-change="changeDirection"
            :isSorting="isSorting"
            :isPaused="isPaused"
            :elapsedTime="elapsedTime"
            :currentArray="originalArray"
            :arrayParams="arrayParams"
          />
        </aside>

        <!-- Área principal de visualización -->
        <section class="visualization-area">
          <!-- Display de Arrays -->
          <div class="arrays-display-wrapper">
          <ArrayDisplay 
            :before="originalArray"
            :after="sortedArray"
          />
          </div>
          
          <!-- Visualización de Burbujas -->
          <div class="animation-wrapper">
          <BubbleAnimation 
            :array="displayArray"
            :currentIndex="currentIndex"
            :comparingIndices="comparingIndices"
            :swappingIndices="swappingIndices"
            :minValue="minValue"
            :maxValue="maxValue"
            :isSorting="isSorting"
            :sortedIndices="sortedIndices"
            :selectedAlgorithm="selectedAlgorithm"
          />
          </div>

          <!-- Botones de control -->
          <div class="control-buttons">
            <button @click="resetArray" class="control-btn reset-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Reiniciar</span>
            </button>
            
            <button @click="shuffleArray" class="control-btn shuffle-btn" :disabled="originalArray.length === 0">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3H21V8M16 21H21V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 3L14 10M21 21L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 8V3H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 3L10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Desordenar</span>
            </button>
            
            <button @click="pauseResumeSort" :disabled="!isSorting && !isPaused" class="control-btn pause-btn">
              <svg v-if="!isPaused" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4H6V20H10V4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 4H14V20H18V4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ isPaused ? 'Reanudar' : 'Pausar' }}</span>
            </button>
            
            <button @click="clearAll" class="control-btn clear-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Borrar</span>
            </button>
          </div>
        </section>
      </main>
    </div>

    <!-- ✅ BOTÓN DE AYUDA (igual que en Asignacion.vue) -->
    <button @click="showHelp = true" class="help-button" title="Ayuda">?</button>

    <!-- ✅ MODAL DE AYUDA CON PDF DE SORTS -->
    <Help
      v-if="showHelp"
      pdfEmbedUrl="https://drive.google.com/file/d/1q0D0Lz9KsNj2LsQCJNzI3GSeR8HQjYXQ/preview"
      pdfViewerUrl="https://drive.google.com/file/d/1q0D0Lz9KsNj2LsQCJNzI3GSeR8HQjYXQ/view?usp=drive_link"
      :currentTheme="theme"
      @close="showHelp = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import Help from '../../../components/Help.vue'; // ✅ Importado

import ControlPanel from './ControlPanel.vue';
import ArrayDisplay from './ArrayDisplay.vue';
import BubbleAnimation from './BubbleAnimation.vue';

// =============================================
// CONFIGURACIÓN INICIAL Y ESTADO REACTIVO
// =============================================

const theme = ref(localStorage.getItem('data-theme') || 'light-theme');
const showHelp = ref(false); // ✅ Control del modal de ayuda

// ... (todo el resto de tu lógica permanece igual)

// Estados principales para los arrays
const originalArray = ref([]);        // Array original sin ordenar
const sortedArray = ref([]);          // Array después del ordenamiento
const displayArray = ref([]);         // Array que se muestra durante la animación

// Estados del proceso de ordenamiento
const isSorting = ref(false);         // Indica si se está ejecutando un algoritmo
const isPaused = ref(false);          // Indica si el ordenamiento está en pausa
const elapsedTime = ref(0);           // Tiempo transcurrido del ordenamiento

// Estados para la visualización de animaciones
const currentIndex = ref(-1);         // Índice actual siendo procesado
const comparingIndices = ref([]);     // Índices que se están comparando
const swappingIndices = ref([]);      // Índices que se están intercambiando
const sortedIndices = ref([]);        // Índices que ya están ordenados

// Configuración del algoritmo
const selectedAlgorithm = ref('bubble');  // Algoritmo seleccionado
const sortDirection = ref(true);          // true = ascendente, false = descendente
const animationSpeed = ref(110);          // Velocidad de la animación en ms

// Parámetros del array - gestionados de forma reactiva
const arrayParams = reactive({
  size: '',  // Cantidad de elementos
  min: '',   // Valor mínimo
  max: ''    // Valor máximo
});

// Valores para la visualización de burbujas
const minValue = ref(0);
const maxValue = ref(0);

// Variables para el control del timer
let timerInterval = null;
let startTime = 0;

// =============================================
// FUNCIONES DE GENERACIÓN DE ARRAYS
// =============================================

/**
 * Genera parámetros aleatorios para el array
 * @returns {Object} Objeto con size, min y max aleatorios
 */
const generateRandomParams = () => {
  const randomSize = Math.floor(Math.random() * 16) + 10; // 10-25 elementos
  const randomMin = Math.floor(Math.random() * 50) + 1;   // 1-50
  const randomMax = Math.floor(Math.random() * 200) + 100; // 100-300
  
  return {
    size: randomSize,
    min: randomMin,
    max: randomMax
  };
};

/**
 * Genera un array basado en parámetros o aleatoriamente
 * @param {number} size - Cantidad de elementos
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 */
const generateArray = (size = arrayParams.size, min = arrayParams.min, max = arrayParams.max) => {
  let finalSize, finalMin, finalMax;
  
  // Caso 1: Generación completamente aleatoria (sin parámetros)
  if (size === '' && min === '' && max === '') {
    const randomParams = generateRandomParams();
    finalSize = randomParams.size;
    finalMin = randomParams.min;
    finalMax = randomParams.max;
    
    // Actualizar parámetros con los valores aleatorios generados
    arrayParams.size = finalSize;
    arrayParams.min = finalMin;
    arrayParams.max = finalMax;
  } 
  // Caso 2: Generación con parámetros específicos
  else {
    // Validar que todos los parámetros estén completos
    if (size === '' || min === '' || max === '') {
      alert('Para generar con parámetros, debes especificar Cantidad, Mínimo y Máximo');
      return;
    }
    
    finalSize = parseInt(size);
    finalMin = parseInt(min);
    finalMax = parseInt(max);
    
    // Actualizar parámetros con los valores proporcionados
    arrayParams.size = finalSize;
    arrayParams.min = finalMin;
    arrayParams.max = finalMax;
  }
  
  // Validación de parámetros
  if (finalMin >= finalMax) {
    alert('El valor mínimo debe ser menor que el valor máximo');
    return;
  }
  
  // Generar array con números aleatorios
  originalArray.value = Array.from({ length: finalSize }, 
    () => Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin
  );
  
  // Actualizar valores para la visualización
  minValue.value = finalMin;
  maxValue.value = finalMax;
  
  // Mezclar el array y preparar el estado
  shuffleArray();
  sortedArray.value = [];
  displayArray.value = [...originalArray.value];
  resetAnimationState();
};

/**
 * Procesa y carga un array ingresado manualmente
 * @param {Array} manualArray - Array de números a cargar
 */
const handleManualInput = (manualArray) => {
  if (manualArray && manualArray.length > 0) {
    originalArray.value = manualArray;
    
    // Calcular y actualizar parámetros basados en el array manual
    arrayParams.size = manualArray.length;
    arrayParams.min = Math.min(...manualArray);
    arrayParams.max = Math.max(...manualArray);
    
    minValue.value = arrayParams.min;
    maxValue.value = arrayParams.max;
    
    displayArray.value = [...manualArray];
    sortedArray.value = [];
    resetAnimationState();
  }
};

// =============================================
// FUNCIONES DE MANIPULACIÓN DE ARRAYS
// =============================================

/**
 * Mezcla (shuffle) el array original
 */
const shuffleArray = () => {
  if (originalArray.value.length === 0) return;
  
  const shuffled = [...originalArray.value];
  // Algoritmo Fisher-Yates para mezclar
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  originalArray.value = shuffled;
  displayArray.value = [...shuffled];
  resetAnimationState();
};

/**
 * Reinicia el array a su estado original (sin ordenar)
 */
const resetArray = () => {
  resetAnimationState();
  sortedArray.value = [];
  displayArray.value = [...originalArray.value];
};

/**
 * Limpia completamente todos los datos y parámetros
 */
const clearAll = () => {
  resetAnimationState();
  originalArray.value = [];
  sortedArray.value = [];
  displayArray.value = [];
  
  // Limpiar todos los parámetros
  arrayParams.size = '';
  arrayParams.min = '';
  arrayParams.max = '';
  
  minValue.value = 0;
  maxValue.value = 0;
};

// =============================================
// FUNCIONES DE ANIMACIÓN Y CONTROL
// =============================================

/**
 * Reinicia el estado de animación a sus valores iniciales
 */
const resetAnimationState = () => {
  currentIndex.value = -1;
  comparingIndices.value = [];
  swappingIndices.value = [];
  sortedIndices.value = [];
  isSorting.value = false;
  isPaused.value = false;
  elapsedTime.value = 0;
  
  // Limpiar intervalo del timer si existe
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

/**
 * Pausa o reanuda el proceso de ordenamiento
 */
const pauseResumeSort = () => {
  isPaused.value = !isPaused.value;
};

// =============================================
// ALGORITMOS DE ORDENAMIENTO
// =============================================

/**
 * Inicia el proceso de ordenamiento con el algoritmo seleccionado
 */
const startSort = async () => {
  if (isSorting.value || originalArray.value.length === 0) return;
  
  // Preparar estado inicial
  sortedArray.value = [];
  displayArray.value = [...originalArray.value];
  resetAnimationState();
  
  isSorting.value = true;
  startTime = Date.now();
  
  // Iniciar timer para medir el tiempo de ejecución
  timerInterval = setInterval(() => {
    elapsedTime.value = (Date.now() - startTime) / 1000;
  }, 100);
  
  try {
    const arrayCopy = [...originalArray.value];
    
    // Ejecutar el algoritmo seleccionado
    switch (selectedAlgorithm.value) {
      case 'bubble':
        await bubbleSort(arrayCopy, sortDirection.value);
        break;
      case 'selection':
        await selectionSort(arrayCopy, sortDirection.value);
        break;
      case 'insertion':
        await insertionSort(arrayCopy, sortDirection.value);
        break;
      case 'shell':
        await shellSort(arrayCopy, sortDirection.value);
        break;
      case 'merge':
        await mergeSort(arrayCopy, sortDirection.value);
        break;
    }
    
    // Guardar el resultado ordenado
    sortedArray.value = arrayCopy;
  } catch (error) {
    console.error('Error durante el ordenamiento:', error);
  }
  
  // Finalizar proceso
  isSorting.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

/**
 * Algoritmo Bubble Sort optimizado
 * @param {Array} arr - Array a ordenar
 * @param {boolean} ascending - true para ascendente, false para descendente
 */
const bubbleSort = async (arr, ascending) => {
  const n = arr.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      // Manejar pausa
      while (isPaused.value && isSorting.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!isSorting.value) return;
      
      // Actualizar estado de animación
      currentIndex.value = j;
      comparingIndices.value = [j, j + 1];
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
      
      // Determinar si se debe intercambiar
      const shouldSwap = ascending ? 
        arr[j] > arr[j + 1] : 
        arr[j] < arr[j + 1];
      
      if (shouldSwap) {
        swappingIndices.value = [j, j + 1];
        // Intercambiar elementos
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        
        // Actualizar visualización
        displayArray.value = [...arr];
        await new Promise(resolve => setTimeout(resolve, animationSpeed.value / 2));
        swappingIndices.value = [];
      }
      
      comparingIndices.value = [];
    }
    
    // Marcar elemento como ordenado
    sortedIndices.value.push(n - i - 1);
    
    // Optimización: si no hubo intercambios, el array está ordenado
    if (!swapped) break;
  }
  
  // Marcar todos como ordenados al finalizar
  sortedIndices.value = Array.from({ length: n }, (_, i) => i);
  currentIndex.value = -1;
};

/**
 * Algoritmo Selection Sort
 * @param {Array} arr - Array a ordenar
 * @param {boolean} ascending - true para ascendente, false para descendente
 */
const selectionSort = async (arr, ascending) => {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minMaxIndex = i;
    
    for (let j = i + 1; j < n; j++) {
      // Manejar pausa
      while (isPaused.value && isSorting.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!isSorting.value) return;
      
      // Actualizar estado de animación
      currentIndex.value = j;
      comparingIndices.value = [minMaxIndex, j];
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
      
      // Encontrar el índice del elemento mínimo/máximo
      const shouldUpdate = ascending ? 
        arr[j] < arr[minMaxIndex] : 
        arr[j] > arr[minMaxIndex];
      
      if (shouldUpdate) {
        minMaxIndex = j;
      }
      
      comparingIndices.value = [];
    }
    
    // Intercambiar si es necesario
    if (minMaxIndex !== i) {
      swappingIndices.value = [i, minMaxIndex];
      [arr[i], arr[minMaxIndex]] = [arr[minMaxIndex], arr[i]];
      
      displayArray.value = [...arr];
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
      swappingIndices.value = [];
    }
    
    // Marcar elemento como ordenado
    sortedIndices.value.push(i);
  }
  
  // Marcar último elemento como ordenado
  sortedIndices.value.push(n - 1);
  currentIndex.value = -1;
};

/**
 * Algoritmo Insertion Sort
 * @param {Array} arr - Array a ordenar
 * @param {boolean} ascending - true para ascendente, false para descendente
 */
const insertionSort = async (arr, ascending) => {
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    
    // Manejar pausa
    while (isPaused.value && isSorting.value) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!isSorting.value) return;
    
    // Actualizar estado de animación
    currentIndex.value = i;
    comparingIndices.value = [j, i];
    await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
    
    // Mover elementos mayores/menores que key
    while (j >= 0 && (ascending ? arr[j] > key : arr[j] < key)) {
      comparingIndices.value = [j, j + 1];
      swappingIndices.value = [j, j + 1];
      
      arr[j + 1] = arr[j];
      j = j - 1;
      
      displayArray.value = [...arr];
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
      
      comparingIndices.value = [];
      swappingIndices.value = [];
    }
    
    arr[j + 1] = key;
    displayArray.value = [...arr];
    
    // Marcar elementos ordenados
    sortedIndices.value = Array.from({ length: i + 1 }, (_, idx) => idx);
  }
  
  currentIndex.value = -1;
  comparingIndices.value = [];
  swappingIndices.value = [];
};

const shellSort = async (arr, ascending) => {
  const n = arr.length;
  let h = 1;
  
  while (h < Math.floor(n / 3)) {
    h = 3 * h + 1; //Tamaño de los saltos
  }
  
  while (h >= 1) {
    for (let i = h; i < n; i++) {
      let temp = arr[i]; // Guardamos el valor a insertar
      let j = i;
      
      while (j >= h) {
        // Pausa si está en pausa
        while (isPaused.value && isSorting.value) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!isSorting.value) return;
        
        currentIndex.value = j;
        comparingIndices.value = [j, j - h];
        
        await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
        
        const shouldShift = ascending 
          ? (j - h >= 0 && arr[j - h] > temp) 
          : (j - h >= 0 && arr[j - h] < temp);
        
        if (!shouldShift) break;
        
        swappingIndices.value = [j, j - h];
        arr[j] = arr[j - h]; // Desplazar elemento
        j -= h;
        
        displayArray.value = [...arr];
        await new Promise(resolve => setTimeout(resolve, animationSpeed.value / 2));
        swappingIndices.value = [];
      }
      
      arr[j] = temp; // Colocar el valor en su posición final
      displayArray.value = [...arr];
      
      // Marcar como ordenado el subarray hasta i (aproximadamente)
      if (h === 1) {
        sortedIndices.value = Array.from({ length: i + 1 }, (_, idx) => idx);
      }
    }
    
    h = Math.floor(h / 3); // Reducir el gap
  }
  
  // Marcar todos como ordenados al final
  sortedIndices.value = Array.from({ length: n }, (_, i) => i);
  sortedArray.value = arr;
  currentIndex.value = -1;
};

//Merge Sort
const mergeSort = async (arr, ascending) => {
  const aux = new Array(arr.length);
  await mergeSortHelper(arr, aux, 0, arr.length - 1, ascending);
  
  // Marcar todos como ordenados al final
  sortedIndices.value = Array.from({ length: arr.length }, (_, i) => i);
  sortedArray.value = arr;
  currentIndex.value = -1;
};

const mergeSortHelper = async (arr, aux, lo, hi, ascending) => {
  if (lo >= hi) return;
  
  const mid = lo + Math.floor((hi - lo) / 2);
  
  await mergeSortHelper(arr, aux, lo, mid, ascending);
  await mergeSortHelper(arr, aux, mid + 1, hi, ascending);
  await mergeHelper(arr, aux, lo, mid, hi, ascending);

  for (let idx = lo; idx <= hi; idx++) {
    sortedIndices.value.push(idx);
  }
  sortedIndices.value = [...new Set(sortedIndices.value)];
};

const mergeHelper = async (arr, aux, lo, mid, hi, ascending) => {
  for (let k = lo; k <= hi; k++) {
    aux[k] = arr[k];
  }
  
  let i = lo;
  let j = mid + 1;
  
  for (let k = lo; k <= hi; k++) {
    while (isPaused.value && isSorting.value) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!isSorting.value) return;
    
    currentIndex.value = k;
    
    if (i <= mid && j <= hi) {
      comparingIndices.value = [i, j];
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
    }
    
    let fromIndex;
    if (i > mid) {
      arr[k] = aux[j];
      fromIndex = j;
      j++;
    } else if (j > hi) {
      arr[k] = aux[i];
      fromIndex = i;
      i++;
    } else {
      const shouldTakeJ = ascending 
        ? aux[j] < aux[i] 
        : aux[j] > aux[i];
      
      if (shouldTakeJ) {
        arr[k] = aux[j];
        fromIndex = j;
        j++;
      } else {
        arr[k] = aux[i];
        fromIndex = i;
        i++;
      }
    }
    
    swappingIndices.value = [k, fromIndex];
    displayArray.value = [...arr];
    await new Promise(resolve => setTimeout(resolve, animationSpeed.value / 2));
    
    swappingIndices.value = [];
    comparingIndices.value = [];
  }
};

// =============================================
// FUNCIONES DE IMPORT/EXPORT
// =============================================

/**
 * Importa un array desde un archivo JSON
 */
const importArray = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validar estructura del JSON
        if (!data.array || !Array.isArray(data.array)) {
          throw new Error('Formato JSON inválido: se esperaba un objeto con propiedad "array"');
        }
        
        // Validar que todos los elementos sean números
        const validArray = data.array.map(num => {
          const parsed = Number(num);
          if (isNaN(parsed)) {
            throw new Error('El array contiene elementos no numéricos');
          }
          return parsed;
        });
        
        if (validArray.length === 0) {
          alert('El array importado está vacío');
          return;
        }
        
        handleManualInput(validArray);
        alert(`Array importado exitosamente: ${validArray.length} elementos`);
        
      } catch (error) {
        alert(`Error al importar el archivo: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
};

/**
 * Exporta el array actual a un archivo JSON con nombre personalizado
 */
const exportArray = () => {
  if (originalArray.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }
  
  // Solicitar nombre personalizado para el archivo
  const fileName = prompt('Ingresa un nombre para el archivo (sin extensión):', `array_${new Date().getTime()}`) || `array_${new Date().getTime()}`;
  
  // Preparar datos para exportar
  const data = {
    array: originalArray.value,
    metadata: {
      size: originalArray.value.length,
      min: Math.min(...originalArray.value),
      max: Math.max(...originalArray.value),
      exportDate: new Date().toISOString(),
      algorithm: selectedAlgorithm.value,
      sortDirection: sortDirection.value ? 'ascendente' : 'descendente'
    }
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Crear enlace de descarga
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  alert(`Array exportado exitosamente como "${fileName}.json"`);
};

// =============================================
// CONFIGURACIÓN INICIAL
// =============================================

/**
 * Cambia el algoritmo de ordenamiento
 * @param {string} algorithm - Nombre del algoritmo
 */
const changeAlgorithm = (algorithm) => {
  selectedAlgorithm.value = algorithm;
};

/**
 * Cambia la dirección del ordenamiento
 * @param {boolean} direction - true para ascendente, false para descendente
 */
const changeDirection = (direction) => {
  sortDirection.value = direction;
};

// No generar array automáticamente al montar el componente
onMounted(() => {
  // Estado inicial vacío
});
</script>

<style scoped>
/* Estilos existentes... */

/* ✅ Estilo del botón de ayuda (igual que en Asignacion.vue) */
.help-button {
  position: fixed;
  right: 25px;
  bottom: 25px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #c59cf8;
  color: white;
  border: none;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
}

.help-button:hover {
  transform: scale(1.1);
  background-color: #0056b3;
}

.sorts-container {
  font-family: 'Oswald', sans-serif;
  min-height: 100vh;
  transition: background-color 0.3s ease;
}



.sorts-content {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  margin-top: 90px;
  background-color: transparent;
}

.sorts-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 24px 30px;
  background: linear-gradient(135deg, rgba(255, 249, 242, 0.95) 0%, rgba(248, 238, 226, 0.9) 100%);
  border-radius: 16px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  box-shadow: 0 8px 32px rgba(139, 115, 85, 0.12);
  backdrop-filter: blur(12px);
}

.dark-theme .sorts-header {
  background: linear-gradient(135deg, rgba(44, 44, 44, 0.95) 0%, rgba(35, 35, 35, 0.9) 100%);
  border-color: rgba(70, 70, 70, 0.5);
}


.header-content {
  flex: 1;
}

.sorts-header h1 {
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  letter-spacing: -0.5px;
}

.dark-theme .sorts-header h1 {
  background: linear-gradient(135deg, #c9b4a4 0%, #e0c9b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #a08970;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.sorts-main {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
  align-items: start;
}

.control-sidebar {
  position: sticky;
  top: 110px;
}

.visualization-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.arrays-display-wrapper,
.animation-wrapper {
  background: linear-gradient(180deg, rgba(255, 249, 242, 0.95) 0%, rgba(248, 238, 226, 0.9) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  box-shadow: 0 8px 32px rgba(139, 115, 85, 0.12);
  backdrop-filter: blur(12px);
}

.dark-theme .arrays-display-wrapper,
.dark-theme .animation-wrapper {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(35, 35, 35, 0.9) 100%);
  border-color: rgba(70, 70, 70, 0.5);
}

.animation-wrapper {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 20px;
  background: linear-gradient(180deg, rgba(255, 249, 242, 0.95) 0%, rgba(248, 238, 226, 0.9) 100%);
  border-radius: 16px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  box-shadow: 0 8px 32px rgba(139, 115, 85, 0.12);
}

.dark-theme .control-buttons {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(35, 35, 35, 0.9) 100%);
  border-color: rgba(70, 70, 70, 0.5);
}

.control-btn {
  padding: 14px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.control-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.control-btn:hover:not(:disabled) svg {
  transform: scale(1.1) rotate(5deg);
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.control-btn:hover:not(:disabled)::before {
  left: 100%;
}

.reset-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.reset-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3182ce, #2c5aa0);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.3);
}

.shuffle-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.shuffle-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #38a169, #2f855a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

.pause-btn {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
}

.pause-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #dd6b20, #c05621);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(237, 137, 54, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.clear-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 101, 101, 0.3);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: grayscale(0.5);
}

</style>