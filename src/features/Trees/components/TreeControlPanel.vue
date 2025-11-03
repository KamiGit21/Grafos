<template>
  <div class="control-panel">
    <div class="manual-section">
      <h3>Construir Árbol</h3>
      
      <div class="input-section">
        <h4>Inserción Manual</h4>
        <div class="manual-input-group">
          <div class="input-with-button">
            <input 
              type="number" 
              v-model.number="nodeValue" 
              placeholder="Ingrese un número"
              class="number-input"
              @keyup.enter="insertNode"
            >
            <button @click="insertNode" class="action-btn insert-btn" :disabled="!canInsert">
              Insertar
            </button>
          </div>
          <div v-if="isDuplicate" class="duplicate-warning">
            ⚠️ Valor duplicado
          </div>
        </div>
      </div>
      
      <div class="control-buttons-grid">
        <button @click="removeLastNode" :disabled="!hasNodes" class="action-btn remove-btn">
          Borrar Último
        </button>
        <button @click="resetTree" class="action-btn reset-btn">
          Reset
        </button>
      </div>
      
      <div class="metrics-section">
        <h4>Métricas</h4>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">Nodos:</span>
            <span class="metric-value">{{ nodeCount }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Altura:</span>
            <span class="metric-value">{{ treeHeight }}</span>
          </div>
        </div>
      </div>
      
      <div class="section-divider">Exportar/Importar</div>
      
      <div class="json-controls">
        <button @click="exportTree" class="action-btn export-btn full-width">
          Exportar JSON
        </button>
        <button @click="importTree" class="action-btn import-btn full-width">
          Importar JSON
        </button>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileImport" 
          accept=".json" 
          style="display: none"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeControlPanel',
  props: {
    nodeCount: Number,
    treeHeight: Number,
    existingValues: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      nodeValue: null
    };
  },
  computed: {
    isValidInput() {
      return this.nodeValue !== null && this.nodeValue !== '';
    },
    isDuplicate() {
      return this.isValidInput && this.existingValues.includes(this.nodeValue);
    },
    canInsert() {
      return this.isValidInput && !this.isDuplicate;
    },
    hasNodes() {
      return this.nodeCount > 0;
    }
  },
  methods: {
    insertNode() {
      if (this.canInsert) {
        this.$emit('insert-node', this.nodeValue);
        this.nodeValue = null;
      }
    },
    removeLastNode() {
      if (confirm('¿Está seguro de que desea eliminar el último nodo insertado?')) {
        this.$emit('remove-last-node');
      }
    },
    resetTree() {
      if (confirm('¿Está seguro de que desea reiniciar el árbol? Se perderán todos los nodos.')) {
        this.$emit('reset-tree');
      }
    },
    exportTree() {
      const fileName = prompt('Ingrese el nombre del archivo (sin extensión):', 'arbol-binario');
      if (fileName === null || fileName.trim() === '') return;
      this.$emit('export-tree', fileName.trim());
    },
    importTree() {
      this.$refs.fileInput.click();
    },
    handleFileImport(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const treeData = JSON.parse(e.target.result);
            this.$emit('import-tree', treeData);
          } catch (error) {
            alert('Error al importar el archivo JSON: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
      event.target.value = '';
    }
  }
};
</script>

<style scoped>
.control-panel {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manual-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px; /* Reducido gap */
}

.manual-section h3 {
  margin-top: 0;
  margin-bottom: 0;
  color: #2d3748;
  text-align: center;
  font-size: 1.3rem; /* Tamaño reducido */
  font-weight: 600;
  letter-spacing: 0.5px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
}

.input-section {
  margin-bottom: 0;
}

.input-section h4 {
  margin: 0 0 12px 0; /* Margen reducido */
  color: #2d3748;
  font-size: 1rem; /* Tamaño reducido */
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.manual-input-group {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Gap reducido */
}

.input-with-button {
  display: flex;
  gap: 8px; /* Gap reducido */
  align-items: stretch;
}

.number-input {
  flex: 1;
  padding: 10px 12px; /* Padding reducido */
  border-radius: 6px;
  border: 2px solid #e2e8f0;
  background-color: white;
  color: #2d3748;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem; /* Tamaño reducido */
  font-weight: 500;
  transition: all 0.3s ease;
}

.number-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  transform: translateY(-1px);
}

.number-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.control-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px; /* Gap reducido */
  margin-bottom: 0;
}

.action-btn {
  padding: 12px 16px; /* Padding reducido */
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem; /* Tamaño reducido */
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  color: white;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  filter: brightness(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: none;
}

.insert-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
  min-width: 80px; /* Ancho reducido */
}

.remove-btn {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.reset-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.export-btn {
  background: linear-gradient(135deg, #805ad5, #6b46c1);
}

.import-btn {
  background: linear-gradient(135deg, #d69e2e, #b7791f);
}

.metrics-section {
  margin-bottom: 0;
  padding: 16px; /* Padding reducido */
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(102, 126, 234, 0.05));
  border-radius: 8px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.metrics-section h4 {
  margin: 0 0 12px 0; /* Margen reducido */
  color: #2d3748;
  font-size: 1rem; /* Tamaño reducido */
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Gap reducido */
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px; /* Padding reducido */
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.metric-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.metric-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.85rem; /* Tamaño reducido */
  letter-spacing: 0.3px;
}

.metric-value {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem; /* Tamaño reducido */
  background: linear-gradient(135deg, #4a90e2, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 30px;
  text-align: center;
}

.section-divider {
  text-align: center;
  margin: 0 0 16px 0; /* Margen reducido */
  color: #718096;
  font-weight: 600;
  font-size: 0.9rem; /* Tamaño reducido */
  letter-spacing: 0.5px;
  position: relative;
  text-transform: uppercase;
}

.section-divider::before,
.section-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 25%; /* Ancho reducido */
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.section-divider::before {
  left: 0;
}

.section-divider::after {
  right: 0;
}

.json-controls {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Gap reducido */
  margin-bottom: 0;
}

.full-width {
  width: 100%;
}

.duplicate-warning {
  color: #e53e3e;
  font-size: 0.8rem; /* Tamaño reducido */
  margin-top: 4px;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.insert-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.3);
}

.remove-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(237, 137, 54, 0.3);
}

.reset-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(245, 101, 101, 0.3);
}

.export-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(128, 90, 213, 0.3);
}

.import-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(214, 158, 46, 0.3);
}

@media (max-width: 768px) {
  .control-panel {
    padding: 12px;
  }
  .manual-section h3 {
    font-size: 1.1rem;
  }
  .input-with-button {
    flex-direction: column;
  }
  .action-btn {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
  .metrics-section {
    padding: 12px;
  }
  .metric-item {
    padding: 6px 10px;
  }
}
</style>