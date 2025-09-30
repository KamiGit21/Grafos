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
        v-model.number="edge.value" 
        placeholder="Valor"
        @keyup.enter="$emit('close')" 
        autofocus 
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

    <label>
      Dirección:
      <select @change="$emit('update-direction', $event)" class="direction-select">
        <option value="none" :selected="!edge.directed">No Dirigido</option>
        <option value="forward" :selected="edge.directed">
          {{ getNodeLabel(edge.from) }} → {{ getNodeLabel(edge.to) }}
        </option>
        <option value="backward">
          {{ getNodeLabel(edge.to) }} → {{ getNodeLabel(edge.from) }}
        </option>
      </select>
    </label>
    
    <button @click="$emit('close')">Guardar</button>
  </div>
</template>

<script setup>
defineProps({
  edge: Object,
  position: Object,
  getNodeLabel: Function
});

defineEmits(['close', 'update-direction']);
</script>

<style scoped>
.edit-box {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  min-width: 250px;
}

.edit-box label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.edit-box input,
.edit-box select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  flex: 1;
}

.edit-box input[type="color"] {
  padding: 0;
  width: 30px;
  height: 30px;
  border: none;
  flex: 0;
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
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background-color: #e9e9e9;
}

.edit-box button:hover {
  background-color: #dcdcdc;
}
</style>