<template>
    <div class="matrix-modal-overlay" @click.self="closeModal">
        <div :class="['matrix-modal-content', theme]">
            <header class="matrix-modal-header">
                <h2>Algoritmo de Asignación (Maximizar)</h2>
                <button class="close-button" @click="closeModal">×</button>
            </header>

            <main class="matrix-modal-body">
                <table v-if="nodes.length > 0 && solutionMatrix.length > 0">
                    <tr>
                        <th></th>
                        <th v-for="n in nodes" :key="'h' + n.id">{{ n.label }}</th>
                    </tr>
                    <tr v-for="(row, rowIndex) in solutionMatrix" :key="'r' + nodes[rowIndex].id">
                        <th>{{ nodes[rowIndex].label }}</th>
                        <td v-for="(weight, colIndex) in row" :key="'c' + nodes[colIndex].id"
                            :class="weight > 0 ? 'highlight-cell' : ''">
                            {{ weight }}
                        </td>
                    </tr>
                </table>
                <p v-else>No hay solución calculada.</p>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['close']);

const props = defineProps({
    nodes: {
        type: Array,
        required: true
    },
    adjacencyMatrix: {
        type: Array,
        required: true
    },
    theme: {
        type: String,
        default: 'light-theme'
    }
});

const solutionMatrix = ref([]);

// ver cambios en la matriz de adyacencia
watch(() => props.adjacencyMatrix, (newVal) => {
    if (!newVal || newVal.length === 0) {
        solutionMatrix.value = [];
        return;
    }

    // ---- Ejemplo dummy: resaltar diagonal ----
    solutionMatrix.value = newVal.map((row, i) =>
        row.map((_, j) => (i === j ? props.adjacencyMatrix[i][j] : 0))
    );

}, { immediate: true });

const closeModal = () => {
    emit('close');
};
</script>

<style scoped>
/* Reutilizar CSS de matriz de adyacencia */
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
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.matrix-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid;
}

.matrix-modal-header h2 {
    margin: 0;
    font-size: 1.3rem;
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

/* Resaltar celdas que forman la solución */
.highlight-cell {
    background-color: #70af4c;
    color: white;
    font-weight: bold;
}

/* Temas */
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
</style>
