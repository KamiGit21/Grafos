<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
   mounted() {
    // Para inicializar los temas 
    this.initializeTheme()
  },
  methods: {
    initializeTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light-theme'
      document.documentElement.setAttribute('data-theme', savedTheme)
      document.body.className = savedTheme === 'dark-theme' ? 'dark-theme' : 'light-theme'
    }
  }
}
</script>

<style>

/* Animation utilities */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading {
  animation: spin 1s linear infinite;
}


</style>