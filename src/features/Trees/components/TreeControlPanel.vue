<template>
  <div class="control-panel">
    <div class="manual-section">
      <h3>Construir Árbol</h3>
      
      <!-- Sección de inserción manual -->
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
            ⚠️ El valor ya existe en el árbol
          </div>
        </div>
      </div>
      
      <!-- Botones de control -->
      <div class="control-buttons-grid">
        <button @click="removeLastNode" :disabled="!hasNodes" class="action-btn remove-btn">
          Borrar Último
        </button>
        <button @click="resetTree" class="action-btn reset-btn">
          Reset
        </button>
      </div>
      
      <!-- Métricas del árbol -->
      <div class="metrics-section">
        <h4>Métricas del Árbol</h4>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-label">Número de Nodos:</span>
            <span class="metric-value">{{ nodeCount }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Altura del Árbol:</span>
            <span class="metric-value">{{ treeHeight }}</span>
          </div>
        </div>
      </div>
      
      <!-- Separador -->
      <div class="section-divider">Exportar/Importar</div>
      
      <!-- Botones de JSON -->
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
      this.$emit('export-tree');
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
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 25px;
  border: 2px solid #4a90e2;
  height: fit-content;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: 'Oswald', sans-serif;
  backdrop-filter: blur(10px);
}

.manual-section h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2d3748;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
}

.input-section {
  margin-bottom: 25px;
}

.input-section h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.manual-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-with-button {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.number-input {
  flex: 1;
  padding: 12px 15px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background-color: white;
  color: #2d3748;
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
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
  gap: 12px;
  margin-bottom: 25px;
}

.action-btn {
  padding: 14px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  color: white;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.action-btn:active:not(:disabled) {
  transform: translateY(-1px);
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
  min-width: 100px;
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
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(102, 126, 234, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.metrics-section h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.metric-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.metric-label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.metric-value {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #4a90e2, #667eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 40px;
  text-align: center;
}

.section-divider {
  text-align: center;
  margin: 25px 0;
  color: #718096;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  position: relative;
  text-transform: uppercase;
}

.section-divider::before,
.section-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 2px;
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
  gap: 12px;
}

.full-width {
  width: 100%;
}

.duplicate-warning {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 6px;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Efectos de hover específicos */
.insert-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
}

.remove-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.4);
}

.reset-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(245, 101, 101, 0.4);
}

.export-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(128, 90, 213, 0.4);
}

.import-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(214, 158, 46, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .control-panel {
    padding: 20px;
  }
  
  .manual-section h3 {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
  
  .input-with-button {
    flex-direction: column;
  }
  
  .insert-btn {
    min-width: auto;
  }
  
  .action-btn {
    padding: 12px 15px;
    font-size: 0.9rem;
  }
  
  .metrics-section {
    padding: 15px;
  }
  
  .metric-item {
    padding: 8px 12px;
  }
  
  .metric-label {
    font-size: 0.9rem;
  }
  
  .metric-value {
    font-size: 1rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .control-panel {
    background: rgba(45, 55, 72, 0.9);
    border-color: #6ab0ff;
    color: #e2e8f0;
  }
  
  .manual-section h3 {
    color: #f7fafc;
    border-bottom-color: #4a5568;
  }
  
  .input-section h4 {
    color: #f7fafc;
  }
  
  .number-input {
    background-color: #4a5568;
    border-color: #718096;
    color: #f7fafc;
  }
  
  .number-input:focus {
    border-color: #6ab0ff;
    box-shadow: 0 0 0 3px rgba(106, 180, 255, 0.2);
  }
  
  .number-input::placeholder {
    color: #a0aec0;
  }
  
  .metrics-section {
    background: linear-gradient(135deg, rgba(106, 180, 255, 0.05), rgba(102, 126, 234, 0.05));
    border-color: rgba(106, 180, 255, 0.2);
  }
  
  .metrics-section h4 {
    color: #f7fafc;
  }
  
  .metric-item {
    background: #4a5568;
    border-color: #718096;
  }
  
  .metric-label {
    color: #e2e8f0;
  }
  
  .metric-value {
    background: linear-gradient(135deg, #6ab0ff, #667eea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .section-divider {
    color: #a0aec0;
  }
  
  .section-divider::before,
  .section-divider::after {
    background: linear-gradient(90deg, transparent, #4a5568, transparent);
  }

  .duplicate-warning {
    color: #feb2b2;
  }
}
</style>