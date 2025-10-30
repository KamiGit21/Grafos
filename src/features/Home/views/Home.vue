<template>
  <div class="home-container">
    <Navbar/>
    <HeroSection/>

    <!-- ✅ BOTÓN DE AYUDA -->
    <button @click="showHelp = true" class="help-button" title="Ayuda">?</button>

    <!-- ✅ MODAL DE AYUDA -->
    <Help
      v-if="showHelp"
      pdfEmbedUrl="https://drive.google.com/file/d/1-joPgGxcUroXIreuMnEx8sXp6hshqBw4/preview"
      pdfViewerUrl="https://drive.google.com/file/d/1-joPgGxcUroXIreuMnEx8sXp6hshqBw4/view?usp=sharing"
      :currentTheme="currentTheme"
      @close="showHelp = false"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import Navbar from '../../../components/Navbar.vue';
import Help from '../../../components/Help.vue'; // ✅ Importado
import HeroSection from '../components/HeroSection.vue';

export default {
  name: 'Home',
  components: {
    Navbar,
    HeroSection,
    Help // ✅ Registrado
  },
  setup() {
    // Obtiene el tema actual desde localStorage
    const currentTheme = localStorage.getItem('data-theme') || 'light-theme';
    
    // Control del modal de ayuda
    const showHelp = ref(false);

    return {
      currentTheme,
      showHelp
    };
  },
  data() {
    return {
      buildNumber: Math.floor(Math.random() * 10000)
    }
  },
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dark-theme .home-container {
  background-color: #121212;
  color: #e0e0e0;
}
.light-theme .home-container {
  background-color: #ffffff;
  color: #121212;
}

/* ✅ Estilo del botón de ayuda (igual que en Asignacion.vue) */
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