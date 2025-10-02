<template>
  <div class="nf-main-container">
    <div class="nf-gradient-overlay"></div>
    
    <div
      v-for="element in floatingElements"
      :key="element.id"
      class="nf-floating-element"
      :style="{
        left: element.x + '%',
        top: element.y + '%',
        animationDelay: element.delay + 's',
        animationDuration: element.duration + 's'
      }"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path v-if="element.type === 'star'" d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>
        <path v-else-if="element.type === 'heart'" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
        <path v-else-if="element.type === 'cloud'" d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        <path v-else-if="element.type === 'sparkles'" d="m9 12 2 2 4-4"/>
        <circle v-else-if="element.type === 'sun'" cx="12" cy="12" r="4"/>
      </svg>
    </div>

    <div 
      class="nf-parallax-container"
      :style="{
        transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`
      }"
    >
      <div class="nf-parallax-shape nf-shape-1"></div>
      <div class="nf-parallax-shape nf-shape-2"></div>
      <div class="nf-parallax-shape nf-shape-3"></div>
    </div>

    <div class="nf-content-container">
      <div class="nf-content-wrapper">
        <div class="nf-error-code-container">
          <h1 class="nf-error-code">404</h1>
          <div class="nf-error-code-shadow">404</div>
        </div>

        <div class="nf-subtitle-container">
          <h2 class="nf-subtitle">¡Ups! Página no encontrada</h2>
          <p class="nf-description">La página que buscas parece haberse perdido en el vacío digital.</p>
          <p class="nf-help-text">¡No te preocupes, te ayudaremos a encontrar el camino de regreso!</p>
        </div>

        <div class="nf-action-buttons">
          <button @click="goHome" class="nf-home-button">
            <div class="nf-button-glow"></div>
            <svg class="nf-button-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span class="nf-button-text">Volver al inicio</span>
          </button>
          
          <button @click="goBack" class="nf-back-button">
            <svg class="nf-button-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            <span class="nf-button-text">Regresar</span>
          </button>
        </div>

        <div class="nf-assistance-container">
          <div class="nf-assistance-wrapper">
            <svg class="nf-assistance-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
            <span class="nf-assistance-text">¿Necesitas ayuda? Contacta a nuestro equipo de soporte</span>
          </div>
        </div>
      </div>
    </div>

    <div class="nf-corner-decoration nf-top-right">
      <svg class="nf-corner-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
      </svg>
    </div>
    <div class="nf-corner-decoration nf-bottom-left">
      <svg class="nf-corner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const mousePosition = ref({ x: 0, y: 0 })
const floatingElements = ref([])

const iconTypes = ['star', 'heart', 'cloud', 'sparkles', 'sun']

onMounted(() => {
  floatingElements.value = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 3,
    type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
  }))

  const handleMouseMove = (e) => {
    mousePosition.value = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    }
  }

  window.addEventListener('mousemove', handleMouseMove)
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  })
})

const goHome = () => {
  window.location.href = '/'
}

const goBack = () => {
  history.back()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

@keyframes nf-fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes nf-custom-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes nf-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(8deg); }
}

@keyframes nf-ping {
  75%, 100% { transform: scale(1.5); opacity: 0; }
}

@keyframes nf-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nf-main-container {
  height: 100vh;
  background: linear-gradient(to bottom right, #4B0082, #1E3A8A, #3730A3);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.nf-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(244, 114, 182, 0.2), rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2));
  animation: nf-custom-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.nf-floating-element {
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  animation: nf-float 6s ease-in-out infinite;
}

.nf-parallax-container {
  position: absolute;
  inset: 0;
  transition: transform 0.8s ease-out;
}

.nf-parallax-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(2rem);
  animation: nf-custom-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.nf-shape-1 {
  top: 3rem; left: 3rem;
  width: 12rem; height: 12rem;
  background: linear-gradient(to right, rgba(244, 114, 182, 0.3), rgba(168, 85, 247, 0.3));
}

.nf-shape-2 {
  bottom: 5rem; right: 5rem;
  width: 15rem; height: 15rem;
  background: linear-gradient(to right, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3));
  animation-delay: 1s;
}

.nf-shape-3 {
  top: 45%; left: 30%;
  width: 10rem; height: 10rem;
  background: linear-gradient(to right, rgba(234, 179, 8, 0.3), rgba(249, 115, 22, 0.3));
  animation-delay: 2s;
}

.nf-content-container {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.nf-content-wrapper {
  text-align: center;
  max-width: 42rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nf-error-code-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.nf-error-code {
  font-size: 6rem;
  font-weight: 900;
  color: transparent;
  background: linear-gradient(to right, #F472B6, #A855F7, #22D3EE);
  -webkit-background-clip: text;
  background-clip: text;
  animation: nf-custom-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  filter: drop-shadow(0 0 1rem rgba(0, 0, 0, 0.5));
}

.nf-error-code-shadow {
  position: absolute;
  inset: 0;
  font-size: 6rem;
  font-weight: 900;
  color: rgba(244, 114, 182, 0.2);
  filter: blur(0.5rem);
  animation: nf-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.nf-subtitle-container {
  margin-bottom: 2rem;
}

.nf-subtitle {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  animation: nf-fade-in-up 0.8s ease-out forwards;
  animation-delay: 0.5s;
  opacity: 0;
}

.nf-description {
  font-size: 1.125rem;
  color: #D1D5DB;
  margin-bottom: 0.5rem;
  animation: nf-fade-in-up 0.8s ease-out forwards;
  animation-delay: 0.7s;
  opacity: 0;
}

.nf-help-text {
  font-size: 1rem;
  color: #9CA3AF;
  animation: nf-fade-in-up 0.8s ease-out forwards;
  animation-delay: 0.9s;
  opacity: 0;
}

.nf-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  animation: nf-fade-in-up 0.8s ease-out forwards;
  animation-delay: 1.1s;
  opacity: 0;
  margin-bottom: 2rem;
}

.nf-home-button, .nf-back-button {
  position: relative;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  justify-content: center;
}

.nf-home-button {
  background: linear-gradient(to right, #F472B6, #A855F7);
  color: white;
}

.nf-back-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.nf-button-icon {
  flex-shrink: 0;
}

.nf-button-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #EC4899, #8B5CF6);
  border-radius: 10px;
  filter: blur(0.5rem);
  opacity: 0;
  transition: opacity 0.5s;
}

.nf-assistance-container {
  animation: nf-fade-in-up 0.8s ease-out forwards;
  animation-delay: 1.3s;
  opacity: 0;
}

.nf-assistance-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2));
  backdrop-filter: blur(4px);
  border-radius: 10px;
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #06B6D4;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  max-width: 350px;
}

.nf-assistance-icon {
  animation: nf-spin 1s linear infinite;
  flex-shrink: 0;
}

.nf-corner-decoration {
  position: absolute;
  animation: nf-float 6s ease-in-out infinite;
}

.nf-top-right {
  top: 1.5rem; right: 1.5rem;
  animation-delay: 2s;
  color: rgba(244, 114, 182, 0.6);
}

.nf-bottom-left {
  bottom: 1.5rem; left: 1.5rem;
  animation-delay: 2.5s;
  color: rgba(234, 179, 8, 0.6);
}

.nf-home-button:hover, .nf-back-button:hover, .nf-assistance-wrapper:hover {
  transform: scale(1.05);
}

.nf-home-button:hover .nf-button-glow {
  opacity: 0.75;
}

.nf-assistance-wrapper:hover {
  color: #22D3EE;
}

@media (min-width: 768px) {
  .nf-error-code, .nf-error-code-shadow { font-size: 7rem; }
  .nf-subtitle { font-size: 2.25rem; }
  .nf-description { font-size: 1.25rem; }
  .nf-action-buttons { flex-direction: row; }
  .nf-content-wrapper { padding: 2.5rem; }
}

@media (max-height: 700px) {
  .nf-error-code, .nf-error-code-shadow { font-size: 4.5rem; }
  .nf-subtitle { font-size: 1.75rem; }
  .nf-content-wrapper { padding: 1.5rem; }
  .nf-error-code-container { margin-bottom: 1rem; }
  .nf-subtitle-container { margin-bottom: 1.5rem; }
}
</style>