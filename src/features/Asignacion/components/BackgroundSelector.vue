<template>
  <div class="background-selector">
    <button 
      @click="$emit('set-background', 'grid')" 
      :class="{ 'active': canvasBackgroundStyle === 'grid' }"
      title="Fondo de Cuadrícula"
    >
      ▦
    </button>
    <button 
      @click="$emit('set-background', 'dots')" 
      :class="{ 'active': canvasBackgroundStyle === 'dots' }"
      title="Fondo de Puntos"
    >
      ⠶
    </button>
    <button 
      @click="$emit('set-background', 'blank')" 
      :class="{ 'active': canvasBackgroundStyle === 'blank' }"
      title="Fondo Blanco"
    >
      ∅
    </button>
    <label class="color-picker-label" title="Color de Fondo">
      <input 
        type="color" 
        :value="canvasBackgroundColor" 
        @input="$emit('update-color', $event.target.value)" 
      />
    </label>
  </div>
</template>

<script setup>
defineProps({
  canvasBackgroundStyle: String,
  canvasBackgroundColor: String
});

defineEmits(['set-background', 'update-color']);
</script>

<style scoped>
.background-selector {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 5px;
  border: 1px solid #e0c9b6;
  border-radius: 5px;
}

.background-selector button {
  padding: 6px 10px;
  border: 1px solid #e0c9b6;
  background-color: #fff9f2;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.background-selector button:hover {
  background-color: #f3e8dd;
}

.background-selector button.active {
  background-color: #e0c9b6;
}

.color-picker-label {
  display: flex;
  align-items: center;
}

.color-picker-label input[type="color"] {
  width: 30px;
  height: 30px;
  padding: 0;
  cursor: pointer;
  border: 1px solid #e0c9b6;
  border-radius: 4px;
}
</style>