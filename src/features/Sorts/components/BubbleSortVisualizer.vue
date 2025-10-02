<template>
  <div class="sorts-container" :class="theme">
    <Navbar :theme="theme"/>
    <div class="sorts-content">
      
      <header class="sorts-header">
        <h1>Algoritmos de Ordenamiento</h1>
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
          <ArrayDisplay 
            :before="originalArray"
            :after="sortedArray"
          />
          
          <!-- Visualización de Burbujas -->
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

          <!-- Botones de control -->
          <div class="control-buttons">
            <button @click="resetArray" class="control-btn">Reiniciar</button>
            <button @click="shuffleArray" class="control-btn shuffle-btn" :disabled="originalArray.length === 0">Desordenar</button>
            <button @click="pauseResumeSort" :disabled="!isSorting && !isPaused" class="control-btn">
              {{ isPaused ? 'Reanudar' : 'Pausar' }}
            </button>
            <button @click="clearAll" class="control-btn clear-btn">Borrar</button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import ControlPanel from './ControlPanel.vue';
import ArrayDisplay from './ArrayDisplay.vue';
import BubbleAnimation from './BubbleAnimation.vue';

// =============================================
// CONFIGURACIÓN INICIAL Y ESTADO REACTIVO
// =============================================

const theme = ref(localStorage.getItem('data-theme') || 'light-theme');

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
/* Estilos permanecen iguales */
.sorts-container {
  min-height: 100vh;
  font-family: 'Oswald', sans-serif;
  transition: background-color 0.3s;
}

.light-theme .sorts-container {
  background-color: #f9f9f9;
  color: #333;
}

.dark-theme .sorts-container {
  background-color: #2a2a2a;
  color: #e0e0e0;
}

.sorts-content {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 80px;
}

.sorts-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.8)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 12px;
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.sorts-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 600;
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  letter-spacing: 1px;
}

.sorts-main {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 25px;
  align-items: start;
}

.control-sidebar {
  position: sticky;
  top: 100px;
}

.visualization-area {
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.8)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 12px;
  padding: 20px;
  border: 2px solid v-bind('theme === "light-theme" ? "#4a90e2" : "#6ab0ff"');
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-height: 500px;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.8)" : "rgba(58, 58, 58, 0.9)"');
  border-radius: 8px;
  border: 1px solid v-bind('theme === "light-theme" ? "#ddd" : "#555"');
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.control-btn {
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: v-bind('theme === "light-theme" ? "#f0f0f0" : "#4f4f4f"');
  border: 1px solid v-bind('theme === "light-theme" ? "#ccc" : "#666"');
  color: v-bind('theme === "light-theme" ? "#333" : "#e0e0e0"');
  letter-spacing: 0.5px;
}

.shuffle-btn {
  background-color: v-bind('theme === "light-theme" ? "#48bb78" : "#2d7d46"');
  border-color: v-bind('theme === "light-theme" ? "#38a169" : "#225e3a"');
  color: white;
}

.clear-btn {
  background-color: v-bind('theme === "light-theme" ? "#ff6b6b" : "#d32f2f"');
  border-color: v-bind('theme === "light-theme" ? "#ff5252" : "#b71c1c"');
  color: white;
}

.control-btn:hover:not(:disabled) {
  background-color: v-bind('theme === "light-theme" ? "#e0e0e0" : "#5a5a5a"');
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.shuffle-btn:hover:not(:disabled) {
  background-color: v-bind('theme === "light-theme" ? "#38a169" : "#225e3a"');
}

.clear-btn:hover:not(:disabled) {
  background-color: v-bind('theme === "light-theme" ? "#ff5252" : "#c62828"');
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 1024px) {
  .sorts-main {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .control-sidebar {
    position: static;
  }
  
  .sorts-header h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .sorts-content {
    padding: 15px;
    margin-top: 70px;
  }
  
  .control-buttons {
    flex-direction: column;
  }
  
  .control-btn {
    width: 100%;
  }
}
</style>