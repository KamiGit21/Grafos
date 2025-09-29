
<template>
  <div class="home-container">
    <Navbar/>
    <HeroSection/>
  </div>
</template>

<script>
import Navbar from '../../../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'

export default {
  name: 'Home',
  components: {
    Navbar,
    HeroSection
  },
  data() {
    return {
      buildNumber: Math.floor(Math.random() * 10000)
    }
  },
  mounted() {
    this.setupSmoothScrolling()
    this.initializeTheme()
  },
  methods: {
    setupSmoothScrolling() {
      document.documentElement.style.scrollBehavior = 'smooth'
    },
    initializeTheme() {
      const savedTheme = localStorage.getItem('theme') || 'dark-theme'
      this.applyTheme(savedTheme)
    },
    applyTheme(theme) {
      document.body.className = theme
    }
  }
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
</style>