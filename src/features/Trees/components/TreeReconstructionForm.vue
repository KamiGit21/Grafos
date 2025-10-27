<template>
  <div class="reconstruction-form">
    <div class="manual-section">
      <h3>Reconstruir Árbol</h3>
      
      <!-- Selección de método -->
      <div class="method-section">
        <h4>Método de Reconstrucción</h4>
        <div class="method-buttons">
          <button 
            @click="selectedMethod = 'inPre'" 
            :class="['method-btn', { 'active': selectedMethod === 'inPre' }]"
          >
            In-Orden + Pre-Orden
          </button>
          <button 
            @click="selectedMethod = 'inPost'" 
            :class="['method-btn', { 'active': selectedMethod === 'inPost' }]"
          >
            In-Orden + Post-Orden
          </button>
        </div>
      </div>

      <!-- Campos de entrada -->
      <div class="input-section">
        <h4>Recorridos del Árbol</h4>
        
        <!-- In-Orden (siempre visible) -->
        <div class="input-group">
          <label>In-Orden (obligatorio):</label>
          <input 
            type="text" 
            v-model="inOrderInput" 
            placeholder="Ej: 4, 2, 5, 1, 3"
            class="traversal-input"
          >
        </div>

        <!-- Pre-Orden (solo para método inPre) -->
        <div class="input-group" v-if="selectedMethod === 'inPre'">
          <label>Pre-Orden:</label>
          <input 
            type="text" 
            v-model="preOrderInput" 
            placeholder="Ej: 1, 2, 4, 5, 3"
            class="traversal-input"
          >
        </div>

        <!-- Post-Orden (solo para método inPost) -->
        <div class="input-group" v-if="selectedMethod === 'inPost'">
          <label>Post-Orden:</label>
          <input 
            type="text" 
            v-model="postOrderInput" 
            placeholder="Ej: 4, 5, 2, 3, 1"
            class="traversal-input"
          >
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <button @click="reconstructTree" :disabled="!canReconstruct" class="action-btn reconstruct-btn">
          Reconstruir Árbol
        </button>
        <button @click="resetForm" class="action-btn reset-btn">
          Reset
        </button>
      </div>

      <!-- Separador -->
      <div class="section-divider">Exportar/Importar</div>

      <!-- Controles JSON -->
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

      <!-- Información de ayuda -->
      <div class="help-section">
        <h4>📝 Instrucciones</h4>
        <div class="help-content">
          <p>• <strong>In-Orden + Pre-Orden:</strong> Reconstruye el árbol a partir de los recorridos In-Orden y Pre-Orden</p>
          <p>• <strong>In-Orden + Post-Orden:</strong> Reconstruye el árbol a partir de los recorridos In-Orden y Post-Orden</p>
          <p>• Los números deben estar separados por comas</p>
          <p>• El árbol debe ser un BST válido para reconstrucción exitosa</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeReconstructionForm',
  data() {
    return {
      selectedMethod: 'inPre',
      inOrderInput: '',
      preOrderInput: '',
      postOrderInput: ''
    };
  },
  computed: {
    canReconstruct() {
      if (!this.inOrderInput.trim()) return false;
      
      if (this.selectedMethod === 'inPre') {
        return this.preOrderInput.trim() !== '';
      } else {
        return this.postOrderInput.trim() !== '';
      }
    }
  },
  methods: {
    reconstructTree() {
      try {
        const inOrder = this.parseInput(this.inOrderInput);
        let otherOrder, method;
        
        if (this.selectedMethod === 'inPre') {
          otherOrder = this.parseInput(this.preOrderInput);
          method = 'inPre';
        } else {
          otherOrder = this.parseInput(this.postOrderInput);
          method = 'inPost';
        }
        
        this.$emit('reconstruct-tree', {
          method,
          inOrder,
          otherOrder
        });
        
      } catch (error) {
        alert('Error al procesar los datos: ' + error.message);
      }
    },
    resetForm() {
      if (confirm('¿Está seguro de que desea reiniciar el formulario?')) {
        this.inOrderInput = '';
        this.preOrderInput = '';
        this.postOrderInput = '';
        this.$emit('reset-tree');
      }
    },
    parseInput(input) {
      return input.split(',')
        .map(item => item.trim())
        .filter(item => item !== '')
        .map(item => {
          const num = Number(item);
          if (isNaN(num)) {
            throw new Error(`"${item}" no es un número válido`);
          }
          return num;
        });
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
.reconstruction-form {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 25px;
  border: 2px solid #805ad5;
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

.method-section {
  margin-bottom: 25px;
}

.method-section h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.method-buttons {
  display: flex;
  gap: 12px;
}

.method-btn {
  flex: 1;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(248, 248, 248, 0.8), rgba(240, 240, 240, 0.8));
  border: 2px solid #e2e8f0;
  color: #4a5568;
  letter-spacing: 0.3px;
  text-align: center;
}

.method-btn.active {
  background: linear-gradient(135deg, #805ad5, #6b46c1);
  border-color: #805ad5;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(128, 90, 213, 0.3);
}

.method-btn:hover:not(.active) {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-color: #805ad5;
  transform: translateY(-1px);
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

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.traversal-input {
  width: 100%;
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

.traversal-input:focus {
  outline: none;
  border-color: #805ad5;
  box-shadow: 0 0 0 3px rgba(128, 90, 213, 0.2);
  transform: translateY(-1px);
}

.traversal-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.action-buttons {
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

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: none;
}

.reconstruct-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.reconstruct-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
}

.reset-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.reset-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(245, 101, 101, 0.4);
}

.export-btn {
  background: linear-gradient(135deg, #805ad5, #6b46c1);
}

.export-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(128, 90, 213, 0.4);
}

.import-btn {
  background: linear-gradient(135deg, #d69e2e, #b7791f);
}

.import-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(214, 158, 46, 0.4);
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
  margin-bottom: 25px;
}

.full-width {
  width: 100%;
}

.help-section {
  padding: 20px;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(102, 126, 234, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.help-section h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-content p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.4;
  letter-spacing: 0.2px;
}

.help-content strong {
  color: #2d3748;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .reconstruction-form {
    padding: 20px;
  }
  
  .manual-section h3 {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
  
  .method-buttons {
    flex-direction: column;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    padding: 12px 15px;
    font-size: 0.9rem;
  }
  
  .help-section {
    padding: 15px;
  }
  
  .help-content p {
    font-size: 0.85rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .reconstruction-form {
    background: rgba(45, 55, 72, 0.9);
    border-color: #9f7aea;
    color: #e2e8f0;
  }
  
  .manual-section h3 {
    color: #f7fafc;
    border-bottom-color: #4a5568;
  }
  
  .method-section h4,
  .input-section h4,
  .help-section h4 {
    color: #f7fafc;
  }
  
  .method-btn {
    background: linear-gradient(135deg, rgba(74, 85, 104, 0.8), rgba(45, 55, 72, 0.8));
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .method-btn.active {
    background: linear-gradient(135deg, #9f7aea, #805ad5);
    border-color: #9f7aea;
  }
  
  .method-btn:hover:not(.active) {
    background: linear-gradient(135deg, #5a6578, #3d4758);
    border-color: #9f7aea;
  }
  
  .input-group label {
    color: #f7fafc;
  }
  
  .traversal-input {
    background-color: #4a5568;
    border-color: #718096;
    color: #f7fafc;
  }
  
  .traversal-input:focus {
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.2);
  }
  
  .traversal-input::placeholder {
    color: #a0aec0;
  }
  
  .section-divider {
    color: #a0aec0;
  }
  
  .section-divider::before,
  .section-divider::after {
    background: linear-gradient(90deg, transparent, #4a5568, transparent);
  }
  
  .help-section {
    background: linear-gradient(135deg, rgba(106, 180, 255, 0.05), rgba(102, 126, 234, 0.05));
    border-color: rgba(106, 180, 255, 0.2);
  }
  
  .help-content p {
    color: #e2e8f0;
  }
  
  .help-content strong {
    color: #f7fafc;
  }
}
</style>