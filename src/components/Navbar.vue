<template>
  <div class="toolbar-top" :class="theme">
    <nav>
      <button 
        v-for="item in navItems" 
        :key="item.name" 
        :class="{ active: activeRoute === item.route }" 
        @click="navigate(item.route)"
      >
        {{ item.name }}
      </button>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    theme: {
      type: String,
      default: 'light-theme'
    }
  },
  data() {
    return {
      navItems: [
        { name: 'Home', route: '/' },
        { name: 'Pizarra de Grafos', route: '/graph-board' },
        { name: 'Northwest', route: '/northwest' },
        { name: 'Arboles', route: '/arboles' }
      ],
      activeRoute: this.$route ? this.$route.path : '/'
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
    }
  }
}
</script>

<style scoped>
.toolbar-top {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: flex-start; /* Alinea todo a la izquierda */
  align-items: center;
  padding: 10px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-direction: column; /* Mantiene el h1 y nav en columnas */
  gap: 10px;
  flex-shrink: 0;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding-bottom: 20px;
}

.toolbar-top nav {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start; /* <- este hace que no se centren verticalmente */
  flex-wrap: wrap;
  gap: 10px;
  width: 100%; /* asegura que ocupe el ancho completo */
}

.toolbar-top nav button {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  font-family: 'Oswald', sans-serif;
}

.light-theme .toolbar-top {
  background-color: rgba(253, 246, 236, 0.9);
  border-bottom: 1px solid #e0c9b6;
}

.light-theme .toolbar-top h1 {
  color: #333;
}

.light-theme .toolbar-top nav button {
  border: 1px solid #e0c9b6;
  background-color: #fff9f2;
  color: #333;
}

.light-theme .toolbar-top nav button:hover {
  background-color: #f3e8dd;
}

.light-theme .toolbar-top nav button.active {
  background-color: #e0c9b6;
  border-color: #c9b4a4;
}

.dark-theme .toolbar-top {
  background-color: rgba(60, 60, 60, 0.9);
  border-bottom: 1px solid #555;
}

.dark-theme .toolbar-top h1 {
  color: #f0f0f0;
}

.dark-theme .toolbar-top nav button {
  border: 1px solid #555;
  background-color: #444;
  color: #e0e0e0;
}

.dark-theme .toolbar-top nav button:hover {
  background-color: #555;
}

.dark-theme .toolbar-top nav button.active {
  background-color: #555;
  border-color: #666;
}
</style>