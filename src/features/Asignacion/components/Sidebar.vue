<template>
  <aside class="sidebar-left">
    <div class="tool-group">
      <button 
        @click="$emit('toggle-node-mode', 'circle')" 
        :class="{ 'active': isAddingNode && nodeShape === 'circle' }"
        title="Añadir Nodo Círculo"
      >
        ⚪
      </button>
      <button 
        @click="$emit('toggle-node-mode', 'oval')" 
        :class="{ 'active': isAddingNode && nodeShape === 'oval' }"
        title="Añadir Nodo Óvalo"
      >
        🥚
      </button>
    </div>

    <button 
      @click="$emit('toggle-edge-mode')" 
      :class="{ 'active': isAddingEdge }" 
      title="Añadir Arista"
    >
      ↔️
    </button>
    
    <button 
      @click="$emit('toggle-eraser')" 
      :class="{ 'active': isEraserActive }" 
      title="Borrador"
    >
      🧽
    </button>
    
    <button 
      @click="$emit('toggle-matrix')" 
      :class="{ 'active': showMatrix }" 
      title="Ver Matriz"
    >
      📊
    </button>

    <button 
      @click="$emit('clear-canvas')" 
      title="Borrar todo"
    >
      🗑️
    </button>
  </aside>
</template>

<script setup>
defineProps({
  isAddingNode: Boolean,
  nodeShape: String,
  isAddingEdge: Boolean,
  isEraserActive: Boolean,
  showMatrix: Boolean
});

defineEmits([
  'toggle-node-mode',
  'toggle-edge-mode',
  'toggle-eraser',
  'toggle-matrix',
  'clear-canvas'
]);
</script>

<style scoped>
.sidebar-left {
  width: 60px;
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
  background-color: rgba(253, 246, 236, 0.85);
  border-right: 1px solid #e0c9b6;
}

.sidebar-left button {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e0c9b6;
  background-color: #fff9f2;
}

.sidebar-left button:hover {
  transform: translateY(-2px);
  background-color: #f3e8dd;
}

.sidebar-left button.active {
  background-color: #e0c9b6;
  border-color: #c9b4a4;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

</style>