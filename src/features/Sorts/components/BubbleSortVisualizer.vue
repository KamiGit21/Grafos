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
            @sort="startSort"
            @import="importArray"
            @export="exportArray"
            @algorithm-change="changeAlgorithm"
            @direction-change="changeDirection"
            :isSorting="isSorting"
            :isPaused="isPaused"
            :elapsedTime="elapsedTime"
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
import { ref, onMounted } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import ControlPanel from './ControlPanel.vue';
import ArrayDisplay from './ArrayDisplay.vue';
import BubbleAnimation from './BubbleAnimation.vue';

const theme = ref(localStorage.getItem('data-theme') || 'light-theme');

// Estado reactivo - INICIALMENTE VACÍO
const originalArray = ref([]);
const sortedArray = ref([]);
const displayArray = ref([]);
const arraySize = ref('');
const minValue = ref('');
const maxValue = ref('');
const isSorting = ref(false);
const isPaused = ref(false);
const elapsedTime = ref(0);
const currentIndex = ref(-1);
const comparingIndices = ref([]);
const swappingIndices = ref([]);
const sortedIndices = ref([]);
const selectedAlgorithm = ref('bubble');
const sortDirection = ref(true);
const animationSpeed = ref(500);

// Timer
let timerInterval = null;
let startTime = 0;

// Generar parámetros aleatorios si no se especifican
const generateRandomParams = () => {
  const randomSize = Math.floor(Math.random() * 16) + 10; // 10-25 elementos
  const randomMin = Math.floor(Math.random() * 50) + 1; // 1-50
  const randomMax = Math.floor(Math.random() * 200) + 100; // 100-300
  
  return {
    size: randomSize,
    min: randomMin,
    max: randomMax
  };
};

// Generar array aleatorio
const generateArray = (size = arraySize.value, min = minValue.value, max = maxValue.value) => {
  // Si todos los parámetros están vacíos, generar parámetros aleatorios
  if (size === '' && min === '' && max === '') {
    const randomParams = generateRandomParams();
    size = randomParams.size;
    min = randomParams.min;
    max = randomParams.max;
  }
  
  // Usar valores por defecto si están vacíos individualmente
  const finalSize = size === '' ? 15 : size;
  const finalMin = min === '' ? 10 : min;
  const finalMax = max === '' ? 100 : max;
  
  // Validar que min < max
  if (finalMin >= finalMax) {
    alert('El valor mínimo debe ser menor que el valor máximo');
    return;
  }
  
  arraySize.value = finalSize;
  minValue.value = finalMin;
  maxValue.value = finalMax;
  
  // Generar array desordenado
  originalArray.value = Array.from({ length: finalSize }, 
    () => Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin
  );
  
  // Asegurar que esté desordenado mezclando
  shuffleArray();
  
  sortedArray.value = [];
  displayArray.value = [...originalArray.value];
  resetAnimationState();
};

// Función para desordenar el array
const shuffleArray = () => {
  if (originalArray.value.length === 0) return;
  
  const shuffled = [...originalArray.value];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  originalArray.value = shuffled;
  displayArray.value = [...shuffled];
  resetAnimationState();
};

// Resetear estado de animación
const resetAnimationState = () => {
  currentIndex.value = -1;
  comparingIndices.value = [];
  swappingIndices.value = [];
  sortedIndices.value = [];
  isSorting.value = false;
  isPaused.value = false;
  elapsedTime.value = 0;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Cambiar algoritmo
const changeAlgorithm = (algorithm) => {
  selectedAlgorithm.value = algorithm;
};

// Cambiar dirección
const changeDirection = (direction) => {
  sortDirection.value = direction;
};

// Iniciar ordenamiento
const startSort = async () => {
  if (isSorting.value || originalArray.value.length === 0) return;
  
  sortedArray.value = [];
  displayArray.value = [...originalArray.value];
  resetAnimationState();
  
  isSorting.value = true;
  startTime = Date.now();
  
  timerInterval = setInterval(() => {
    elapsedTime.value = (Date.now() - startTime) / 1000;
  }, 100);
  
  try {
    switch (selectedAlgorithm.value) {
      case 'bubble':
        await bubbleSort([...originalArray.value], sortDirection.value);
        break;
      case 'selection':
        await selectionSort([...originalArray.value], sortDirection.value);
        break;
      case 'insertion':
        await insertionSort([...originalArray.value], sortDirection.value);
        break;
    }
  } catch (error) {
    console.error('Error durante el ordenamiento:', error);
  }
  
  isSorting.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Algoritmo Bubble Sort optimizado (basado en el código C++ proporcionado)
const bubbleSort = async (arr, ascending) => {
  const n = arr.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    
    for (let j = 0; j < n - i - 1; j++) {
      // Pausa si está en pausa
      while (isPaused.value && isSorting.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!isSorting.value) return;
      
      currentIndex.value = j;
      comparingIndices.value = [j, j + 1];
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
      
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
    
    // Marcar elemento ordenado
    sortedIndices.value.push(n - i - 1);
    
    // Si no hubo intercambios, el array está ordenado
    if (!swapped) break;
  }
  
  // Marcar todos como ordenados
  sortedIndices.value = Array.from({ length: n }, (_, i) => i);
  sortedArray.value = arr;
  currentIndex.value = -1;
};

// Algoritmo Selection Sort (basado en el código Java proporcionado)
const selectionSort = async (arr, ascending) => {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minMaxIndex = i;
    
    for (let j = i + 1; j < n; j++) {
      // Pausa si está en pausa
      while (isPaused.value && isSorting.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!isSorting.value) return;
      
      currentIndex.value = j;
      comparingIndices.value = [minMaxIndex, j];
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed.value));
      
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
    
    // Marcar elemento ordenado
    sortedIndices.value.push(i);
  }
  
  // Marcar último elemento como ordenado
  sortedIndices.value.push(n - 1);
  sortedArray.value = arr;
  currentIndex.value = -1;
};

// Algoritmo Insertion Sort (basado en el código Java proporcionado)
const insertionSort = async (arr, ascending) => {
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    
    // Pausa si está en pausa
    while (isPaused.value && isSorting.value) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!isSorting.value) return;
    
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
  
  sortedArray.value = arr;
  currentIndex.value = -1;
  comparingIndices.value = [];
  swappingIndices.value = [];
};

// Pausar/Reanudar
const pauseResumeSort = () => {
  isPaused.value = !isPaused.value;
};

// Resetear array al estado original
const resetArray = () => {
  resetAnimationState();
  sortedArray.value = [];
  displayArray.value = [...originalArray.value];
};

// Borrar todo - NUEVA FUNCIÓN
const clearAll = () => {
  resetAnimationState();
  originalArray.value = [];
  sortedArray.value = [];
  displayArray.value = [];
  arraySize.value = '';
  minValue.value = '';
  maxValue.value = '';
};

// Importar array manualmente
const importArray = (arrayString) => {
  try {
    const newArray = arrayString.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    if (newArray.length > 0) {
      originalArray.value = newArray;
      arraySize.value = newArray.length;
      minValue.value = Math.min(...newArray);
      maxValue.value = Math.max(...newArray);
      displayArray.value = [...newArray];
      resetAnimationState();
    } else {
      alert('Por favor ingresa números válidos separados por comas.');
    }
  } catch (error) {
    alert('Error al importar el array. Asegúrate de que esté en el formato correcto (ej: 64, 33, 229, 261).');
  }
};

// Exportar array
const exportArray = () => {
  if (originalArray.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }
  
  const arrayString = originalArray.value.join(', ');
  navigator.clipboard.writeText(arrayString).then(() => {
    alert('Array copiado al portapapeles: ' + arrayString);
  }).catch(() => {
    // Fallback para navegadores que no soportan clipboard
    const textArea = document.createElement('textarea');
    textArea.value = arrayString;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Array copiado: ' + arrayString);
  });
};

// NO generar array automáticamente al montar
onMounted(() => {
  // No generar array automáticamente, dejar en blanco
});
</script>

<style scoped>
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