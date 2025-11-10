<template>
  <div 
    class="edit-box" 
    :style="position"
    @mousedown.stop
  >
    <label>
      Valor: 
      <input 
        type="number" 
        step="any" 
        min="0"
        v-model.number="edge.value" 
        placeholder="Valor"
        @keyup.enter="$emit('close')" 
        autofocus
        @keydown="allowOnlyPositiveNumbers" 
      />
    </label>
    
    <div class="style-pickers">
      <label>Color: <input type="color" v-model="edge.color" /></label>
      <label>Grosor: <input type="number" v-model="edge.strokeWidth" min="1" max="10" /></label>
    </div>
    
    <label>
      Estilo:
      <select v-model="edge.strokeDasharray">
        <option value="0">Sólido</option>
        <option value="5,5">Trazos</option>
        <option value="2,2">Punteado</option>
      </select>
    </label>

    <!-- Kruskal: edges are undirected, no direction controls -->
    
    <button @click="$emit('close')">Guardar</button>
  </div>
</template>

<script setup>

const props = defineProps({
  edge: Object,
  position: Object
});

const allowOnlyPositiveNumbers = (event) => {
  const key = event.key;
  if (key === '.') {
    return;
  }
  
  if (key === '-' || key.toLowerCase() === 'e') {
    event.preventDefault();
  }
};

defineEmits(['close']);
</script>

<style scoped>
.edit-box {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 15px;
  border-radius: 8px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #dad9d9;
  min-width: 250px;
  font-family: 'Oswald', sans-serif;
}

.edit-box label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-family: 'Oswald', sans-serif;
}

.edit-box input,
.edit-box select {
  padding: 5px;
  border-radius: 1px;
  border: 1px solid #ccc;
  flex: 1;
  font-family: 'Oswald', sans-serif;
}

.edit-box input[type="color"] {
  padding: 0;
  width: 100%;
  height: 30px;
  border: none;
}

.style-pickers {
  display: flex;
  gap: 10px;
  width: 100%;
}

.style-pickers label {
  flex: 1;
}

.direction-select {
  width: 100%;
}

.edit-box button {
  align-self: flex-end;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  background-color: #e9e9e9;
}

.edit-box button:hover {
  background-color: #dcdcdc;
}

.dark-theme .edit-box {
  background-color: rgba(50, 50, 50, 1);
  border: 1px solid #555;
}

.dark-theme .edit-box input[type="number"] {
  background-color: #333;
  color: #eee;
  border: 1px solid #555;
}

.dark-theme .edit-box button {
  background-color: #555;
  color: #eee;
}

.dark-theme .edit-box button:hover {
  background-color: #666;
}

.dark-theme .edit-box input[type="color"] {
  border: none;
  cursor: pointer;
  font-family: 'Oswald', sans-serif;
  background-color: rgba(50, 50, 50, 0.95);
  color: #eee;
}

.dark-theme .edit-box select {
  background-color: #333;
  color: #eee;
  border: 1px solid #555;
}

.dark-theme .style-pickers label {
  flex: 1;
}

</style>