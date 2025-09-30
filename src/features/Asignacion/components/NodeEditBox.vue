<template>
  <div 
    class="edit-box"
    :style="{ 
      left: `${(node.x + panX) * zoomLevel}px`, 
      top: `${(node.y + panY) * zoomLevel}px` 
    }"
    @mousedown.stop
  >
    <input 
      type="text" 
      v-model="node.label" 
      placeholder="Nombre" 
      @keyup.enter="$emit('close')"
      autofocus 
    />
    <div class="color-pickers">
      <label>Relleno: <input type="color" v-model="node.color" /></label>
      <label>Borde: <input type="color" v-model="node.borderColor" /></label>
    </div>
    <button @click="$emit('close')">Guardar</button>
  </div>
</template>

<script setup>
defineProps({
  node: Object,
  zoomLevel: Number,
  panX: Number,
  panY: Number
});

defineEmits(['close']);
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
}

.edit-box input[type="text"] {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
}

.color-pickers {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.color-pickers label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.edit-box input[type="color"] {
  padding: 0;
  width: 30px;
  height: 30px;
  border: none;
  cursor: pointer;
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