<template>
  <section class="hero-section" :class="currentTheme">
    <!-- Objetos flotantes -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
      <div class="shape shape-5"></div>
    </div>
    
    <!-- Orbes lol -->
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    
    <div class="hero-content">
      <!-- Animated badge -->
      
      <h1 class="hero-title">
        <span class="title-word" style="--delay: 0">Proyecto&nbsp;</span>
        <span class="title-word" style="--delay: 1">de&nbsp;</span>
        <span class="title-word" style="--delay: 2">la&nbsp;</span>
        <span class="title-word" style="--delay: 3">materia&nbsp;</span>
        <br>
        <span class="gradient-text">
          <span class="title-word" style="--delay: 4">Análisis&nbsp;</span>
          <span class="title-word" style="--delay: 5">de&nbsp;</span>
          <span class="title-word" style="--delay: 6">Algoritmos&nbsp;</span>
        </span>
      </h1>
      
      <p class="hero-description">
        Resuelve y visualiza grafos de manera interactiva con algoritmos avanzados.
        <br>
        <span class="highlight-text">Crea, edita y analiza</span> estructuras de datos con una experiencia visual única.
      </p>
      
      <div class="hero-actions">
        <button class="btn-primary" @mouseenter="handleButtonHover" @mousemove="handleButtonMove" @mouseleave="handleButtonLeave">
          <span class="btn-content">
            <span class="btn-text">Descubrir mas</span>
            <span class="arrow">→</span>
          </span>
          <span class="btn-glow"></span>
        </button>
        
        <button class="btn-secondary">
          <span class="play-icon-wrapper">
            <span class="play-icon">▶</span>
            <span class="play-ripple"></span>
          </span>
          <span>Inicia con Grafos</span>
        </button>
      </div>
      
      <!-- Animated stats -->
      <div class="hero-stats">
        <div class="stat-item" v-for="(stat, index) in stats" :key="index" :style="`--stat-delay: ${index * 0.1}s`">
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  data() {
    return {
      stats: [
        { number: '4+', label: 'Algoritmos' },
        { number: '99%', label: 'Precisión' },
        { number: '24/7', label: 'Disponible' }
      ]
    }
  },
  methods: {
    handleButtonHover(e) {
      const btn = e.currentTarget;
      btn.classList.add('hover-active');
    },
    handleButtonMove(e) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      btn.style.setProperty('--mouse-x', `${x}px`);
      btn.style.setProperty('--mouse-y', `${y}px`);
    },
    handleButtonLeave(e) {
      const btn = e.currentTarget;
      btn.classList.remove('hover-active');
    }
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0; }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
}

@keyframes drawLine {
  from { stroke-dashoffset: 200; }
  to { stroke-dashoffset: 0; }
}

@keyframes nodePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.hero-section {
  padding: 120px 20px 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  position: relative;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  top: 60%;
  right: 15%;
  animation-delay: -5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  bottom: 20%;
  left: 20%;
  animation-delay: -10s;
}

.shape-4 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  top: 30%;
  right: 25%;
  animation-delay: -15s;
}

.shape-5 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  bottom: 10%;
  right: 10%;
  animation-delay: -7s;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
  animation: float 15s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  top: -200px;
  left: -200px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.hero-content {
  max-width: 900px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  position: relative;
}

.pulse-dot::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #6366f1;
  animation: pulse 2s infinite;
}

.hero-title {
  font-size: 72px;
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 32px 0;
  letter-spacing: -0.02em;
  font-family: 'Oswald', sans-serif;
}

.title-word {
  display: inline-block;
  animation: fadeInUp 0.8s ease-out;
  animation-delay: calc(var(--delay) * 0.1s);
  animation-fill-mode: both;
}

.hero-description {
  font-size: 20px;
  line-height: 1.8;
  margin: 0 0 48px 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Oswald', sans-serif;
  animation: fadeInUp 1s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.highlight-text {
  font-weight: 600;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 80px;
  animation: fadeInUp 1.2s ease-out;
  animation-delay: 0.5s;
  animation-fill-mode: both;
}

.btn-primary,
.btn-secondary {
  padding: 18px 36px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: 'Oswald', sans-serif;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #ffffff;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
  --mouse-x: 50%;
  --mouse-y: 50%;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  left: var(--mouse-x);
  top: var(--mouse-y);
  transform: translate(-50%, -50%);
}

.btn-primary.hover-active .btn-glow {
  opacity: 1;
}

.btn-primary:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.5);
}

.btn-primary:active {
  transform: translateY(-2px) scale(1.02);
}

.arrow {
  transition: transform 0.3s ease;
  font-size: 20px;
}

.btn-primary:hover .arrow {
  transform: translateX(6px);
}

.btn-secondary {
  backdrop-filter: blur(10px);
  border: 2px solid;
  position: relative;
}

.btn-secondary:hover {
  transform: translateY(-4px) scale(1.05);
}

.play-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.play-icon {
  font-size: 12px;
  position: relative;
  z-index: 1;
}

.play-ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #6366f1;
  animation: pulse 2s infinite;
}

.hero-stats {
  display: flex;
  gap: 60px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px 48px;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid;
  margin-bottom: 60px;
  animation: fadeInUp 1.4s ease-out;
  animation-delay: 0.7s;
  animation-fill-mode: both;
}

.stat-item {
  text-align: center;
  animation: slideInFromLeft 0.8s ease-out;
  animation-delay: var(--stat-delay);
  animation-fill-mode: both;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  font-family: 'Oswald', sans-serif;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.node-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #6366f1;
  animation: pulse 2s infinite;
  animation-delay: calc(var(--node-index) * 0.2s);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 20px 60px;
  }
  
  .hero-title {
    font-size: 42px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .hero-stats {
    gap: 30px;
    padding: 24px 32px;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  .shape {
    opacity: 0.05;
  }
}

/* Dark Theme */
.dark-theme .hero-section {
  color: #e0e0e0;
}

.dark-theme .badge {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .hero-title {
  color: #ffffff;
}

.dark-theme .hero-description {
  color: rgba(255, 255, 255, 0.8);
}

.dark-theme .btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.dark-theme .btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.dark-theme .hero-stats {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .stat-label {
  color: rgba(255, 255, 255, 0.6);
}

/* Light Theme */
.light-theme .hero-section {
  color: #333;
}

.light-theme .badge {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.8);
}

.light-theme .hero-title {
  color: #1a1a1a;
}

.light-theme .hero-description {
  color: rgba(0, 0, 0, 0.7);
}

.light-theme .btn-secondary {
  background-color: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
  border-color: rgba(0, 0, 0, 0.15);
}

.light-theme .btn-secondary:hover {
  background-color: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.2);
}

.light-theme .hero-stats {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
}

.light-theme .stat-label {
  color: rgba(0, 0, 0, 0.6);
}

</style>