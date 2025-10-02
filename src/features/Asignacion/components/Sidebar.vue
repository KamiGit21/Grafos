<template>
  <aside class="sidebar-left">
    <div class="sidebar-header">
      <div class="status-indicator" :class="{ 'active': isAddingNode || isAddingEdge || isEraserActive }">
        <span class="status-dot"></span>
      </div>
    </div>

    <div class="tools-container">
      <div class="tool-section">
        <span class="section-label">Nodos</span>
        <div class="tool-group">
          <button 
            @click="$emit('toggle-node-mode', 'circle')" 
            :class="{ 'active': isAddingNode && nodeShape === 'circle' }"
            class="tool-btn"
            title="Añadir Nodo Círculo"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="btn-label">Círculo</span>
          </button>
          
          <button 
            @click="$emit('toggle-node-mode', 'oval')" 
            :class="{ 'active': isAddingNode && nodeShape === 'oval' }"
            class="tool-btn"
            title="Añadir Nodo Óvalo"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="btn-label">Óvalo</span>
          </button>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tool-section">
        <span class="section-label">Tools</span>
        
        <button 
          @click="$emit('toggle-edge-mode')" 
          :class="{ 'active': isAddingEdge }" 
          class="tool-btn"
          title="Añadir Arista"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L15 8M19 12L15 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="btn-label">Arista</span>
        </button>
        
        <button 
          @click="$emit('toggle-eraser')" 
          :class="{ 'active': isEraserActive }" 
          class="tool-btn"
          title="Borrador"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.24 3.56L21.19 8.5C21.97 9.29 21.97 10.55 21.19 11.34L12.12 20.41L2.81 21.19L3.59 11.88L12.66 2.81C13.45 2.03 14.71 2.03 15.5 2.81L16.24 3.56Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 6L18 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="btn-label">Borrador</span>
        </button>
        
        <button 
          @click="$emit('toggle-matrix')" 
          :class="{ 'active': showMatrix }" 
          class="tool-btn"
          title="Ver Matriz"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="btn-label">Matriz</span>
        </button>
      </div>

      <div class="divider"></div>

      <button 
        @click="$emit('clear-canvas')" 
        class="tool-btn danger-btn"
        title="Borrar todo"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 11V17M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="btn-label">Limpiar</span>
      </button>
    </div>
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
  width: 80px;
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(253, 246, 236, 0.95) 0%, rgba(248, 238, 226, 0.95) 100%);
  border-right: 1px solid rgba(224, 201, 182, 0.3);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.sidebar-header {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid rgba(224, 201, 182, 0.2);
  background: rgba(253, 246, 236, 0.5);
}

.status-indicator {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c9b4a4;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: rgba(139, 195, 74, 0.15);
}

.status-indicator.active .status-dot {
  background: #8bc34a;
  animation: pulse 2s ease-in-out infinite;
}

.brand-icon {
  width: 36px;
  height: 36px;
  color: #c9a887;
  transition: transform 0.3s ease, color 0.3s ease;
}

.brand-icon:hover {
  transform: rotate(360deg) scale(1.1);
}
.status-indicator.active .status-dot {
  background: #8bc34a;
  animation: pulse 2s ease-in-out infinite;
}

.tools-container {
  flex: 1;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #a08970;
  padding: 0 8px;
  margin-bottom: 2px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  position: relative;
  width: 100%;
  height: 52px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border: 2px solid rgba(224, 201, 182, 0.3);
  background: rgba(255, 249, 242, 0.8);
  backdrop-filter: blur(5px);
  overflow: hidden;
}

.tool-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.tool-btn:hover::before {
  left: 100%;
}

.tool-btn svg {
  width: 22px;
  height: 22px;
  color: #8b7355;
  transition: all 0.3s ease;
  z-index: 1;
}

.btn-label {
  font-size: 8px;
  font-weight: 600;
  color: #8b7355;
  opacity: 0.8;
  transition: all 0.3s ease;
  z-index: 1;
}

.tool-btn:hover {
  transform: translateY(-2px);
  background: rgba(243, 232, 221, 0.95);
  border-color: rgba(201, 168, 135, 0.5);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
}

.tool-btn:hover svg {
  transform: scale(1.15);
  color: #6d5940;
}

.tool-btn:hover .btn-label {
  opacity: 1;
  color: #6d5940;
}

.tool-btn:active {
  transform: translateY(0);
}

.tool-btn.active {
  background: linear-gradient(135deg, #e0c9b6 0%, #d4baaa 100%);
  border-color: #c9b4a4;
  box-shadow: 
    0 4px 12px rgba(139, 115, 85, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.tool-btn.active svg {
  color: #5a4638;
  transform: scale(1.1);
}

.tool-btn.active .btn-label {
  color: #5a4638;
  opacity: 1;
  font-weight: 700;
}

.danger-btn:hover {
  background: rgba(255, 235, 235, 0.95);
  border-color: rgba(255, 120, 120, 0.3);
}

.danger-btn:hover svg {
  color: #d64545;
}

.danger-btn:hover .btn-label {
  color: #d64545;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(224, 201, 182, 0.3), transparent);
  margin: 4px 0;
}

.sidebar-footer {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(224, 201, 182, 0.2);
}

.status-indicator {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(224, 201, 182, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c9b4a4;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: rgba(139, 195, 74, 0.2);
  box-shadow: 0 0 0 4px rgba(139, 195, 74, 0.1);
}

.status-indicator.active .status-dot {
  background: #8bc34a;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* Dark Theme */
.dark-theme .sidebar-left {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.95) 0%, rgba(35, 35, 35, 0.95) 100%);
  border-right: 1px solid rgba(70, 70, 70, 0.3);
}

.dark-theme .sidebar-header {
  border-bottom: 1px solid rgba(70, 70, 70, 0.3);
  background: rgba(35, 35, 35, 0.5);
}

.dark-theme .status-indicator.active {
  background: rgba(139, 195, 74, 0.15);
}

.dark-theme .status-dot {
  background: #777777;
}

.dark-theme .status-indicator.active .status-dot {
  background: #8bc34a;
}

.dark-theme .section-label {
  color: #a08970;
}

.dark-theme .tool-btn {
  background: rgba(58, 58, 58, 0.8);
  border-color: rgba(70, 70, 70, 0.5);
}

.dark-theme .tool-btn svg {
  color: #c9b4a4;
}

.dark-theme .btn-label {
  color: #c9b4a4;
}

.dark-theme .tool-btn:hover {
  background: rgba(74, 74, 74, 0.95);
  border-color: rgba(139, 115, 85, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-theme .tool-btn:hover svg {
  color: #e0c9b6;
}

.dark-theme .tool-btn:hover .btn-label {
  color: #e0c9b6;
}

.dark-theme .tool-btn.active {
  background: linear-gradient(135deg, #666565 0%, #555555 100%);
  border-color: #777777;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.dark-theme .tool-btn.active svg {
  color: #f5e6d3;
}

.dark-theme .tool-btn.active .btn-label {
  color: #f5e6d3;
}

.dark-theme .danger-btn:hover {
  background: rgba(70, 40, 40, 0.95);
  border-color: rgba(255, 120, 120, 0.3);
}

.dark-theme .danger-btn:hover svg {
  color: #ff6b6b;
}

.dark-theme .danger-btn:hover .btn-label {
  color: #ff6b6b;
}

.dark-theme .divider {
  background: linear-gradient(90deg, transparent, rgba(70, 70, 70, 0.3), transparent);
}

/* Scrollbar */
.tools-container::-webkit-scrollbar {
  width: 4px;
}

.tools-container::-webkit-scrollbar-track {
  background: transparent;
}

.tools-container::-webkit-scrollbar-thumb {
  background: rgba(224, 201, 182, 0.3);
  border-radius: 2px;
}

.dark-theme .tools-container::-webkit-scrollbar-thumb {
  background: rgba(70, 70, 70, 0.5);
}
</style>