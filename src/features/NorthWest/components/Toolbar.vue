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
            <button @click="$emit('export-json')" class="toolbar-btn" title="Exportar como JSON">
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
  </header>
</template>

<script setup>
defineProps({
  currentOptimizationMode: String 
});

defineEmits([
  'export-json',
  'import-json',
  'solve-minimize',
  'solve-maximize'
]);
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



@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
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
}
</style>