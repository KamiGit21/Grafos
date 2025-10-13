<template>
  <header class="toolbar-top">
    <div class="header-content">
      <div class="brand-section">
        <h1>ALGORITMO NORTHWEST</h1>
      </div>
      
      <nav class="toolbar-nav">
        <div class="nav-group export-group">
          <span class="group-label">Exportar</span>
          <div class="button-group">  
            <button @click="handleExportJson" class="toolbar-btn" title="Exportar como JSON">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8L16 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3V8H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11V17M9 14H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>JSON</span>
            </button>
          </div>
        </div>

        <div class="divider-vertical"></div>

        <div class="nav-group">
          <span class="group-label">Importar</span>
          <button @click="$emit('import-json')" class="toolbar-btn" title="Importar JSON">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Archivo</span>
          </button>
        </div>

        <div class="divider-vertical"></div>

        <div class="nav-group">
          <span class="group-label">Resolver NorthWest</span>
          <div class="button-group">
            <button 
              @click="$emit('solve-minimize')"
              :class="{ 'active': currentOptimizationMode === 'minimize' }"
              class="toolbar-btn assignment-btn"
              title="Resolver minimizando costos"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 15L9 21M9 21L15 15M9 21V3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Minimizar</span>
            </button>

            <button 
              @click="$emit('solve-maximize')"
              :class="{ 'active': currentOptimizationMode === 'maximize' }"
              class="toolbar-btn assignment-btn"
              title="Resolver maximizando beneficios"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 9L15 3M15 3L9 9M15 3V21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Maximizar</span>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Modal para nombre personalizado -->
    <div v-if="showFilenameModal" class="modal-overlay" @click.self="closeModal">
      <div class="filename-modal">
        <div class="modal-header">
          <h3>Nombre del Archivo</h3>
          <button @click="closeModal" class="modal-close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Ingresa un nombre personalizado para el archivo JSON:</p>
          <input 
            type="text" 
            v-model="customFilename" 
            @keyup.enter="confirmExport"
            placeholder="Ej: solucion-northwest-enero"
            class="filename-input"
            ref="filenameInput"
          />
          <div class="filename-preview">
            <span class="preview-label">Archivo:</span>
            <span class="preview-filename">{{ customFilename || 'solucion-northwest' }}.json</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="modal-btn cancel-btn">Cancelar</button>
          <button @click="confirmExport" class="modal-btn confirm-btn" :disabled="!customFilename.trim()">
            Descargar
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const props = defineProps({
  currentOptimizationMode: String 
});

// Estados para el modal de nombre personalizado
const showFilenameModal = ref(false);
const customFilename = ref('');
const filenameInput = ref(null);

const emit = defineEmits([
  'export-json',
  'import-json',
  'solve-minimize',
  'solve-maximize'
]);

/**
 * Maneja la exportación JSON con nombre personalizado
 */
const handleExportJson = () => {
  // Generar nombre por defecto basado en fecha
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0] + '_' + 
                   date.getHours() + '-' + date.getMinutes();
  customFilename.value = `solucion-northwest-${timestamp}`;
  
  // Mostrar modal
  showFilenameModal.value = true;
  
  // Enfocar el input después de que el modal se renderice
  nextTick(() => {
    if (filenameInput.value) {
      filenameInput.value.focus();
      filenameInput.value.select();
    }
  });
};

/**
 * Confirma la exportación con el nombre personalizado
 */
const confirmExport = () => {
  if (!customFilename.value.trim()) {
    return;
  }
  
  // Emitir evento con el nombre personalizado
  emit('export-json', customFilename.value.trim() + '.json');
  
  // Cerrar modal
  closeModal();
};

/**
 * Cierra el modal y limpia el estado
 */
const closeModal = () => {
  showFilenameModal.value = false;
  customFilename.value = '';
};
</script>

<style scoped>
.toolbar-top {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(180deg, rgba(253, 246, 236, 0.98) 0%, rgba(248, 238, 226, 0.95) 100%);
  border-bottom: 1px solid rgba(224, 201, 182, 0.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  position: relative;
}

.header-content {
  width: 100%;
  max-width: 1600px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-top h1 {
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.toolbar-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.group-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #a08970;
  margin-bottom: 2px;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toolbar-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(224, 201, 182, 0.3);
  background: rgba(255, 249, 242, 0.9);
  font-size: 13px;
  font-weight: 600;
  color: #8b7355;
  overflow: hidden;
}

.toolbar-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.toolbar-btn:hover::before {
  left: 100%;
}

.toolbar-btn svg {
  width: 18px;
  height: 18px;
  color: currentColor;
  transition: transform 0.3s ease;
  z-index: 1;
}

.toolbar-btn span {
  z-index: 1;
}

.toolbar-btn:hover {
  transform: translateY(-2px);
  background: rgba(243, 232, 221, 0.95);
  border-color: rgba(201, 168, 135, 0.5);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
  color: #6d5940;
}

.toolbar-btn:hover svg {
  transform: scale(1.1) rotate(5deg);
}

.toolbar-btn:active {
  transform: translateY(0);
}

.toolbar-btn.active {
  background: linear-gradient(135deg, #e0c9b6 0%, #d4baaa 100%);
  border-color: #c9b4a4;
  box-shadow: 
    0 4px 12px rgba(139, 115, 85, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  color: #5a4638;
}

.toolbar-btn.active svg {
  transform: scale(1.05);
}

.divider-vertical {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, rgba(224, 201, 182, 0.4), transparent);
}

/* Modal para nombre personalizado */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.filename-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.modal-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
}

.modal-close-btn svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 0.95rem;
}

.filename-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
  margin-bottom: 16px;
}

.filename-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.filename-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.preview-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.preview-filename {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #4a90e2;
  background: rgba(74, 144, 226, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: inherit;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #dee2e6;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.confirm-btn {
  background: #4a90e2;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #357abd;
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Dark Theme */
.dark-theme .toolbar-top {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.98) 0%, rgba(35, 35, 35, 0.95) 100%);
  border-bottom: 1px solid rgba(70, 70, 70, 0.3);
}

.dark-theme .brand-icon {
  color: #b89570;
}

.dark-theme .toolbar-top h1 {
  background: linear-gradient(135deg, #c9b4a4 0%, #e0c9b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .group-label {
  color: #a08970;
}

.dark-theme .toolbar-btn {
  background: rgba(58, 58, 58, 0.9);
  border-color: rgba(70, 70, 70, 0.5);
  color: #c9b4a4;
}

.dark-theme .toolbar-btn:hover {
  background: rgba(74, 74, 74, 0.95);
  border-color: rgba(139, 115, 85, 0.5);
  color: #e0c9b6;
}

.dark-theme .toolbar-btn.active {
  background: linear-gradient(135deg, #666565 0%, #555555 100%);
  border-color: #777777;
  color: #f5e6d3;
}

.dark-theme .divider-vertical {
  background: linear-gradient(180deg, transparent, rgba(70, 70, 70, 0.4), transparent);
}

/* Dark theme para el modal */
.dark-theme .filename-modal {
  background: #2d3748;
  color: #e2e8f0;
}

.dark-theme .modal-header {
  border-bottom-color: #4a5568;
}

.dark-theme .modal-header h3 {
  color: #e2e8f0;
}

.dark-theme .modal-close-btn:hover {
  background-color: #4a5568;
}

.dark-theme .modal-close-btn svg {
  color: #cbd5e0;
}

.dark-theme .modal-body p {
  color: #cbd5e0;
}

.dark-theme .filename-input {
  background: #4a5568;
  border-color: #718096;
  color: #e2e8f0;
}

.dark-theme .filename-input:focus {
  border-color: #63b3ed;
  box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.2);
}

.dark-theme .filename-preview {
  background: #4a5568;
  border-color: #718096;
}

.dark-theme .preview-label {
  color: #cbd5e0;
}

.dark-theme .preview-filename {
  color: #63b3ed;
  background: rgba(99, 179, 237, 0.2);
}

.dark-theme .modal-footer {
  border-top-color: #4a5568;
}

.dark-theme .cancel-btn {
  background: #4a5568;
  color: #cbd5e0;
  border-color: #718096;
}

.dark-theme .cancel-btn:hover {
  background: #718096;
}

/* Responsive */
@media (max-width: 1024px) {
  .toolbar-top {
    padding: 12px 16px;
  }
  
  .toolbar-top h1 {
    font-size: 1.3rem;
  }
  
  .toolbar-btn span {
    display: none;
  }
  
  .toolbar-btn {
    padding: 8px;
  }
  
  .group-label {
    font-size: 9px;
  }

  .filename-modal {
    width: 95%;
    margin: 20px;
  }
}

@media (max-width: 768px) {
  .toolbar-nav {
    gap: 12px;
  }
  
  .button-group {
    gap: 6px;
  }
  
  .brand-section {
    gap: 8px;
  }
  
  .brand-icon {
    width: 28px;
    height: 28px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }

  .modal-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
}
</style>