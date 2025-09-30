<template>
  <header class="toolbar-top">
    <div class="header-content">
      <h1>Pizarra de Grafos</h1>
      <nav>
        <button @click="$emit('export-image')">Exportar Imagen</button>
        <button @click="$emit('export-pdf')">Exportar PDF</button>
        <button @click="$emit('export-json')">Exportar JSON</button>
        <button @click="$emit('import-json')">Importar JSON</button>
        
        <BackgroundSelector
          :canvas-background-style="canvasBackgroundStyle"
          :canvas-background-color="canvasBackgroundColor"
          @set-background="$emit('set-background', $event)"
          @update-color="$emit('update-background-color', $event)"
        />
        
        <button 
          @click="$emit('toggle-zoom')" 
          :class="{ 'active': isZoomEnabled }"
          title="Activar/Desactivar Zoom"
        >
          🔍
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import BackgroundSelector from './BackgroundSelector.vue';

defineProps({
  canvasBackgroundStyle: String,
  canvasBackgroundColor: String,
  isZoomEnabled: Boolean
});

defineEmits([
  'export-image',
  'export-pdf',
  'export-json',
  'import-json',
  'set-background',
  'update-background-color',
  'toggle-zoom'
]);
</script>

<style scoped>
.toolbar-top {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.toolbar-top h1 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
}

.toolbar-top nav {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-top nav button {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  border: 1px solid #ccc;
  background-color: #fff;
}

.toolbar-top nav button:hover {
  transform: translateY(-2px);
}

.toolbar-top nav button.active {
  background-color: #e0c9b6;
}
</style>