class ThemeManager {
  constructor() {
    this.currentTheme = 'light-theme'
    this.listeners = []
  }

  // Inicializar el tema (llamar solo una vez en App.vue)
  init() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme'
    this.setTheme(savedTheme, false) // false = no guardar en localStorage otra vez
  }

  // Cambiar el tema
  setTheme(theme, save = true) {
    this.currentTheme = theme
    
    // Aplicar al DOM
    document.documentElement.setAttribute('data-theme', theme)
    document.body.className = theme
    
    // Guardar en localStorage si es necesario
    if (save) {
      localStorage.setItem('theme', theme)
    }
    
    // Notificar a todos los componentes suscritos
    this.notifyListeners()
  }

  // Toggle entre temas
  toggle() {
    const newTheme = this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme'
    this.setTheme(newTheme)
  }

  // Obtener tema actual
  getTheme() {
    return this.currentTheme
  }

  // Suscribirse a cambios de tema
  subscribe(callback) {
    this.listeners.push(callback)
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  // Notificar a todos los listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentTheme))
  }
}

// Exportar instancia única (Singleton)
export default new ThemeManager()