<template>
  <div class="navbar-container" :class="currentTheme">
    <div class="navbar-content">
      <nav class="nav-section">
        <div class="nav-wrapper">
          <button
            v-for="item in navItems"
            :key="item.name"
            :class="['nav-button', { active: activeRoute === item.route }]"
            @click="navigate(item.route)"
            @mouseenter="handleHover"
            @mouseleave="handleLeave"
          >
            <div class="button-content">
              <span class="nav-text">{{ item.name }}</span>
            </div>
            <div class="button-glow"></div>
          </button>
        </div>
      </nav>
      <div class="theme-toggle">
        <button @click="toggleTheme" class="toggle-btn">
          <svg v-if="currentTheme === 'light'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7M12 19C8.13 19 5 15.87 5 12S8.13 5 12 5 19 8.13 19 12 15.87 19 12 19M12 9C10.35 9 9 10.35 9 12S10.35 15 12 15 15 13.65 15 12 13.65 9 12 9Z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import themeManager from '../utils/theme-manager'

export default {
  name: 'Navbar',
  
  data() {
    return {
      navItems: [
        { name: 'Home', route: '/' },
        { name: 'Johnson', route: '/johnson' },
        { name: 'Asignación', route: '/asignacion' },
        { name: 'Northwest', route: '/northwest' },
        { name: 'Sorts', route: '/sorts' },
        { name: 'Trees', route: '/trees' }
      ],
      activeRoute: this.$route ? this.$route.path : '/',
      currentTheme: 'light-theme',
      unsubscribe: null
    }
  },
  
  mounted() {
    // Obtener el tema actual del manager
    this.currentTheme = themeManager.getTheme()
    
    // Suscribirse a cambios de tema
    this.unsubscribe = themeManager.subscribe((newTheme) => {
      this.currentTheme = newTheme
    })
  },
  
  beforeUnmount() {
    // Limpiar la suscripción cuando el componente se destruya
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  
  watch: {
    '$route.path': function(newRoute) {
      this.activeRoute = newRoute
    }
  },
  
  methods: {
    navigate(route) {
      this.$router.push(route)
      this.activeRoute = route
    },
    
    toggleTheme() {
      // Usar el theme manager para cambiar el tema
      themeManager.toggle()
      // No es necesario actualizar this.currentTheme aquí
      // porque el subscribe() lo hará automáticamente
    },
    
    handleHover(event) {
      event.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
    },
    
    handleLeave(event) {
      event.currentTarget.style.transform = 'translateY(0) scale(1)'
    }
  }
}
</script>

<style scoped>
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: transparent;
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
}

.nav-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-wrapper {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2rem;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 107, 157, 0.15);
}

.nav-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 1.5rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  white-space: nowrap;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

.nav-icon {
  width: 1.2rem;
  height: 1.2rem;
  transition: transform 0.3s ease;
}

.nav-text {
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  color: rgb(238, 90, 159);
}

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  opacity: 0;
  border-radius: 1.5rem;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.nav-button:hover .button-glow {
  opacity: 0.15;
}

.nav-button.active .button-glow {
  opacity: 0.25;
}

.nav-button:hover .nav-icon {
  transform: rotate(5deg) scale(1.1);
}

.theme-toggle {
  display: flex;
  align-items: center;
}

.toggle-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ff6b9d, #c44569);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
}

.toggle-btn:hover {
  transform: rotate(180deg) scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
}

.toggle-btn svg {
  width: 1.2rem;
  height: 1.2rem;
}

/* Light theme */
.light .nav-button {
  color: #333;
}

.light .nav-button:hover {
  color: #ff6b9d;
}

.light .nav-button.active {
  color: #c44569;
  font-weight: 700;
}

/* Dark theme */
.dark .nav-button {
  color: #e0e0e0;
}

.dark .nav-button:hover {
  color: #ff6b9d;
}

.dark .nav-button.active {
  color: #ff6b9d;
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@media (max-width: 768px) {
  .navbar-content {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-wrapper {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-button {
    padding: 0.5rem 1rem;
  }
  
  .nav-text {
    font-size: 0.8rem;
  }
}
</style>