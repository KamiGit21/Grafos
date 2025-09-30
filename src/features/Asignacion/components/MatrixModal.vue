<template>
  <div class="matrix-modal-overlay" @click.self="$emit('close')">
    <div :class="['matrix-modal-content', currentTheme]">
      <header class="matrix-modal-header">
        <h2>Matriz de Adyacencia</h2>
        <button @click="$emit('close')" class="close-button">×</button>
      </header>
      <main class="matrix-modal-body" :class="currentTheme">
        <table v-if="nodes.length > 0">
          <tr>
            <th></th>
            <th v-for="n in nodes" :key="'h' + n.id">{{ n.label }}</th>
          </tr>
          <tr v-for="(row, rowIndex) in adjacencyMatrix" :key="'r' + nodes[rowIndex].id">
            <th>{{ nodes[rowIndex].label }}</th>
            <td v-for="(weight, colIndex) in row" :key="'c' + nodes[colIndex].id">
              {{ weight }}
            </td>
          </tr>
        </table>
        <p v-else>No hay nodos para mostrar en la matriz.</p>
      </main>
    </div>
  </div>
</template>

<script setup>
defineProps({
  nodes: Array,
  adjacencyMatrix: Array,
  currentTheme: String
});

defineEmits(['close']);
</script>

<style scoped>
.matrix-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.matrix-modal-content {
  max-width: 80%;
  max-height: 80%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.matrix-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid;
  flex-shrink: 0;
}

.matrix-modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  padding: 0 5px;
  color: #888;
}

.close-button:hover {
  color: #000;
}

.matrix-modal-body {
  padding: 20px;
  overflow: auto;
}

.matrix-modal-body table {
  border-collapse: collapse;
  width: 100%;
}

.matrix-modal-body th,
.matrix-modal-body td {
  border: 1px solid;
  padding: 8px;
  text-align: center;
  min-width: 40px;
}

/* Light theme */
.light-theme.matrix-modal-content {
  background-color: #ffffff;
  color: #333;
}

.light-theme .matrix-modal-header {
  border-bottom-color: #ddd;
}

.light-theme .matrix-modal-body th {
  background-color: #f2f2f2;
}

.light-theme .matrix-modal-body th,
.light-theme .matrix-modal-body td {
  border-color: #ddd;
}

.light-theme .close-button {
  color: #888;
}

.light-theme .close-button:hover {
  color: #000;
}

/* Dark theme */
.dark-theme.matrix-modal-content {
  background-color: #3a3a3a;
  color: #e0e0e0;
}

.dark-theme .matrix-modal-header {
  border-bottom-color: #555;
}

.dark-theme .matrix-modal-body th {
  background-color: #555;
}

.dark-theme .matrix-modal-body th,
.dark-theme .matrix-modal-body td {
  border-color: #666;
}

.dark-theme .close-button {
  color: #bbb;
}

.dark-theme .close-button:hover {
  color: #fff;
}
</style>