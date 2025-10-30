<<<<<<< HEAD
=======

>>>>>>> origin/Santi_branch_2.0
<template>
  <div class="traversal-panel">
    <h3>Recorridos del Árbol</h3>
    
    <div class="traversal-selection">
      <label>Seleccionar recorrido:</label>
      <select v-model="selectedTraversal">
        <option value="inOrder">In-Orden</option>
        <option value="preOrder">Pre-Orden</option>
        <option value="postOrder">Post-Orden</option>
      </select>
    </div>
    
    <div class="animation-controls">
      <button @click="startAnimation" :disabled="!hasNodes || isAnimating" class="btn-primary">
        Iniciar animación
      </button>
      <button @click="stopAnimation" :disabled="!isAnimating" class="btn-warning">
        Detener
      </button>
    </div>
    
    <div class="traversal-result">
      <label>Resultado {{ traversalName }}:</label>
      <div class="result-display">
        {{ traversalResult }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeTraversalPanel',
  props: {
    hasNodes: Boolean,
    isAnimating: Boolean
  },
  data() {
    return {
      selectedTraversal: 'inOrder'
    };
  },
  computed: {
    traversalName() {
      const names = {
        inOrder: 'In-Orden',
        preOrder: 'Pre-Orden',
        postOrder: 'Post-Orden'
      };
      return names[this.selectedTraversal];
    },
    traversalResult() {
      return this.$store.getters.traversalResult || 'No se ha realizado ningún recorrido';
    }
  },
  methods: {
    startAnimation() {
      this.$emit('start-animation', this.selectedTraversal);
    },
    stopAnimation() {
      this.$emit('stop-animation');
    }
  }
};
</script>

<style scoped>
.traversal-panel {
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2d3748;
}

.traversal-selection {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
}

.animation-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-primary {
  background-color: #4299e1;
  color: white;
}

.btn-warning {
  background-color: #ed8936;
  color: white;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  flex: 1;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  opacity: 0.9;
}

.traversal-result {
  margin-top: 1rem;
}

.result-display {
  padding: 0.75rem;
  background-color: #f7fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  min-height: 2.5rem;
  font-family: monospace;
  word-break: break-all;
}
<<<<<<< HEAD
</style>
=======
</style>
>>>>>>> origin/Santi_branch_2.0
