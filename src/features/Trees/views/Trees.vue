<template>
  <div class="trees-container" :class="theme">
    <Navbar :theme="theme"/>
    <div class="trees-content">
      
      <header class="trees-header">
        <h1>Árboles Binarios de Búsqueda</h1>
      </header>

      <main class="trees-main">
        <!-- Panel de pestañas -->
        <div class="tabs-container">
          <button 
            @click="activeTab = 'build'" 
            :class="{ active: activeTab === 'build' }"
            class="tab-button"
          >
            Construir Árbol
          </button>
          <button 
            @click="activeTab = 'reconstruct'" 
            :class="{ active: activeTab === 'reconstruct' }"
            class="tab-button"
          >
            Reconstruir Árbol
          </button>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="tab-content">
          <BuildTreeView v-if="activeTab === 'build'" />
          <ReconstructTreeView v-else />
        </div>
      </main>
    </div>
    <Help
      v-if="showHelp"
      pdfEmbedUrl="https://drive.google.com/file/d/1P7zuzVJYF7oGlsK509FpQgZO3cJcKc_E/preview"
      pdfViewerUrl="https://drive.google.com/file/d/1P7zuzVJYF7oGlsK509FpQgZO3cJcKc_E/view?usp=drive_link"
      :currentTheme="theme"
      @close="showHelp = false"
    />
     <button @click="showHelp = true" class="help-button" title="Ayuda" style="bottom: 25px;">
      ?
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import BuildTreeView from './BuildTreeView.vue';
import ReconstructTreeView from './ReconstructTreeView.vue';
import Help from '../../../components/Help.vue';

export default {
  name: 'Trees',
  components: {
    Navbar,
    BuildTreeView,
    ReconstructTreeView,
    Help
  },
  setup() {
    const theme = ref(localStorage.getItem('data-theme') || 'light-theme');
    const activeTab = ref('build');
    const showHelp = ref(false);

    onMounted(() => {
      // Escuchar cambios de tema si es necesario
    });

    return {
      theme,
      showHelp,
      activeTab
    };
  }
};
</script>

<style scoped>
.trees-container {
  min-height: 100vh;
  font-family: 'Oswald', sans-serif;
  transition: background-color 0.3s;
}

.light-theme .trees-container {
  background: linear-gradient(135deg, #fefaf6 0%, #f8f4f0 100%);
  color: #2c3e50;
}

.dark-theme .trees-container {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: #e2e8f0;
}

.trees-content {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 80px;
}

.trees-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 25px;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.9)" : "rgba(45, 55, 72, 0.9)"');
  border-radius: 16px;
  border: 2px solid v-bind('theme === "light-theme" ? "#e2e8f0" : "#4a5568"');
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.trees-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
  color: v-bind('theme === "light-theme" ? "#2d3748" : "#f7fafc"');
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark-theme .trees-header h1 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.trees-main {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.tabs-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.9)" : "rgba(45, 55, 72, 0.9)"');
  border-radius: 16px;
  border: 2px solid v-bind('theme === "light-theme" ? "#e2e8f0" : "#4a5568"');
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.tab-button {
  padding: 15px 35px;
  border: 2px solid v-bind('theme === "light-theme" ? "#e2e8f0" : "#4a5568"');
  background: linear-gradient(135deg, v-bind('theme === "light-theme" ? "#ffffff" : "#4a5568"') 0%, v-bind('theme === "light-theme" ? "#f8f9fa" : "#2d3748"') 100%);
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Oswald', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: v-bind('theme === "light-theme" ? "#4a5568" : "#e2e8f0"');
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.tab-button:not(.active):hover {
  background: linear-gradient(135deg, v-bind('theme === "light-theme" ? "#f8f9fa" : "#5a6578"') 0%, v-bind('theme === "light-theme" ? "#e9ecef" : "#3d4758"') 100%);
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.tab-content {
  background: v-bind('theme === "light-theme" ? "rgba(255,255,255,0.9)" : "rgba(45, 55, 72, 0.9)"');
  border-radius: 16px;
  border: 2px solid v-bind('theme === "light-theme" ? "#e2e8f0" : "#4a5568"');
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  min-height: 600px;
}

/* Scrollbar personalizado */
.tab-content::-webkit-scrollbar {
  width: 8px;
}

.tab-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.dark-theme .tab-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 1024px) {
  .trees-content {
    padding: 15px;
    margin-top: 70px;
  }
  
  .trees-header h1 {
    font-size: 2rem;
  }
  
  .tabs-container {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .trees-content {
    padding: 10px;
    margin-top: 60px;
  }
  
  .trees-header {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .trees-header h1 {
    font-size: 1.8rem;
  }
  
  .tabs-container {
    padding: 15px;
    gap: 10px;
  }
  
  .tab-button {
    padding: 12px 25px;
    font-size: 1rem;
  }
  
  .tab-content {
    min-height: 500px;
  }
}
.help-button {
  position: fixed;
  right: 25px;
  bottom: 25px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #c59cf8;
  color: white;
  border: none;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: transform 0.2s ease-in-out, background-color 0.2s;
}

.help-button:hover {
  transform: scale(1.1);
  background-color: #0056b3;
}
</style>