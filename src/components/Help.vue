<template>
  <div class="help-modal-overlay" @click.self="closeModal" :class="currentTheme">
    <div class="help-modal-content" >
      <header class="help-modal-header">
        <h2>Manual de Usuario</h2>
        <button class="close-button" @click="closeModal" title="Cerrar">×</button>
      </header>
      
      <main class="help-modal-body">
        <iframe :src="pdfEmbedUrl" frameborder="0"></iframe>
      </main>

      <footer class="help-modal-footer">
        <a :href="pdfViewerUrl" target="_blank" rel="noopener noreferrer">
          <button>Abrir en una nueva pestaña ↗</button>
        </a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Se definen los 'emits' para comunicar al componente padre que se debe cerrar
const emit = defineEmits(['close']);

// Se definen las props que el componente puede recibir, en este caso el tema
const props = defineProps({
  pdfEmbedUrl: {
    type: String,
    default: 'https://drive.google.com/file/d/1-joPgGxcUroXIreuMnEx8sXp6hshqBw4/preview'
  },
  pdfViewerUrl: {
    type: String,
    default: 'https://drive.google.com/file/d/1-joPgGxcUroXIreuMnEx8sXp6hshqBw4/view?usp=sharing'
  },
});

const pdfEmbedUrl = ref(props.pdfEmbedUrl);
const pdfViewerUrl = ref(props.pdfViewerUrl);

// Función que emite el evento 'close' para que el padre cierre el modal
const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.help-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Asegura que esté por encima de todo */
}

.help-modal-content {
  width: 80%;
  height: 90%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  overflow: hidden;
}

.help-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  flex-shrink: 0;
  border-bottom: 1px solid;
}

.help-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}

.help-modal-body {
  flex-grow: 1;
  overflow: hidden;
}

.help-modal-body iframe {
  width: 100%;
  height: 100%;
}

.help-modal-footer {
  padding: 15px;
  text-align: center;
  flex-shrink: 0;
  border-top: 1px solid;
}

.help-modal-footer button {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

/* --- THEME STYLES --- */
.light-theme {
  background-color: #f9f9f9;
  color: #333;
}
.light-theme .help-modal-header { border-bottom-color: #e0e0e0; }
.light-theme .close-button { color: #888; }
.light-theme .close-button:hover { color: #000; }
.light-theme .help-modal-footer { border-top-color: #e0e0e0; }
.light-theme .help-modal-footer button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;
}
.light-theme .help-modal-footer button:hover { background-color: #e0e0e0; }
.light-theme .help-modal-content{
  background-color: #e0e0e0;
}


.dark-theme {
  background-color: #3a3a3a;
  color: #e0e0e0;
}
.dark-theme .help-modal-header { border-bottom-color: #555; }
.dark-theme .close-button { color: #bbb; }
.dark-theme .close-button:hover { color: #fff; }
.dark-theme .help-modal-footer { border-top-color: #555; }
.dark-theme .help-modal-footer button {
  background-color: #4f4f4f;
  border: 1px solid #666;
  color: #e0e0e0;
}
.dark-theme .help-modal-footer button:hover { background-color: #5a5a5a; }
.dark-theme .help-modal-content{
  background-color: #333;
}
</style>