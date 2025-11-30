<template>
  <div class="fuzzy-container" :class="currentTheme">
    <Navbar />
    <div class="fuzzy-content">
      <!-- Header Section -->
       <div class="title-card">
      <section class="hero-section">
        
        <h1 class="main-title">Fuzzy Logic</h1>
        <p class="subtitle">Sistemas de Lógica Difusa para Toma de Decisiones Inteligentes</p>
        <h2 class="main-title2">¿Qué es la Lógica Difusa?</h2>
        <div class="content-card">
          <p>
            La <strong>Lógica Difusa (Fuzzy Logic)</strong> es una forma de lógica que permite manejar conceptos 
            de "parcialmente verdadero" o "parcialmente falso", a diferencia de la lógica booleana tradicional 
            que solo considera valores absolutos (verdadero/falso, 1/0).
          </p>
          <p>
            Desarrollada por Lotfi Zadeh en 1965, esta lógica imita el razonamiento humano permitiendo 
            grados intermedios de membresía, lo que la hace ideal para sistemas donde la precisión 
            matemática es difícil de alcanzar.
          </p>
        </div>
      </section>
      </div>

      <!-- Funciones Principales -->
      <section class="info-section">
        <center>
        <h2 class="section-title">Funciones Principales</h2>
        </center>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Inferencia Difusa</h3>
            <p>Aplicación de reglas "si-entonces" para tomar decisiones basadas en entradas imprecisas</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Control de Sistemas</h3>
            <p>Regulación automática de sistemas complejos sin necesidad de modelos matemáticos exactos</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>Clasificación</h3>
            <p>Categorización de elementos en grupos con límites difusos y grados de pertenencia</p>
          </div>
        </div>
      </section>

      <!-- Partes del Sistema -->
      <section class="info-section">
        <h2 class="section-title">Partes de un Sistema de Lógica Difusa</h2>
        <div class="system-parts">
          <div class="part-item">
            <h3>1. Fuzzificación</h3>
            <p>Conversión de valores numéricos precisos en conjuntos difusos usando funciones de membresía</p>
          </div>
          <div class="part-item">
            <h3>2. Base de Reglas</h3>
            <p>Conjunto de reglas "IF-THEN" que definen el comportamiento del sistema basado en conocimiento experto</p>
          </div>
          <div class="part-item">
            <h3>3. Motor de Inferencia</h3>
            <p>Aplica las reglas difusas a las entradas para generar conclusiones difusas</p>
          </div>
          <div class="part-item">
            <h3>4. Defuzzificación</h3>
            <p>Conversión de los resultados difusos en valores numéricos precisos para su uso práctico</p>
          </div>
        </div>
      </section>

      <!-- Aplicaciones -->
      <section class="info-section">
        <h2 class="section-title">Aplicaciones Prácticas</h2>
        <div class="applications-grid">
          <div class="app-card">
            <h3>🏠 Domótica</h3>
            <ul>
              <li>Control de temperatura en aires acondicionados</li>
              <li>Iluminación automática</li>
              <li>Sistemas de seguridad inteligentes</li>
            </ul>
          </div>
          <div class="app-card">
            <h3>🚗 Automoción</h3>
            <ul>
              <li>Control de frenos ABS</li>
              <li>Sistemas de estacionamiento automático</li>
              <li>Control de tracción</li>
            </ul>
          </div>
          <div class="app-card">
            <h3>🏥 Medicina</h3>
            <ul>
              <li>Diagnóstico médico asistido</li>
              <li>Control de equipos médicos</li>
              <li>Análisis de señales biomédicas</li>
            </ul>
          </div>
          <div class="app-card">
            <h3>🏭 Industria</h3>
            <ul>
              <li>Control de procesos industriales</li>
              <li>Sistemas de calidad</li>
              <li>Robótica y automatización</li>
            </ul>
          </div>
        </div>
      </section>
      </div>

      <!-- Botón de Acción -->
      <section class="action-section">
        <div class="action-card">
          <h1 class="main-title">¿Listo para experimentar con Fuzzy Logic?</h1>
          <p>Haz clic en el botón para abrir el Fuzzy Logic Toolbox de MATLAB y comenzar a crear tus propios sistemas de lógica difusa</p>
          <button @click="openMatlabFuzzy" class="matlab-button">
            <span class="button-icon">⚡</span>
            Abrir Fuzzy Logic en MATLAB
            <span class="button-arrow">→</span>
          </button>
          <p class="note">Asegúrate de tener el servidor MATLAB corriendo en localhost:3000</p>
        </div>
      </section>
    </div>
</template>

<script>
import Navbar from '../../components/Navbar.vue'; // ← ← ← RUTA CORREGIDA
import Swal from 'sweetalert2';

export default {
  name: 'Fuzzy',
  components: {
    Navbar
  },
  data() {
    return {
      currentTheme: localStorage.getItem('data-theme') || 'light-theme'
    };
  },
  methods: {
    async openMatlabFuzzy() {
      // Mostrar loading
      const loadingToast = Swal.fire({
        title: 'Abriendo Fuzzy Logic Toolbox',
        text: 'Iniciando MATLAB...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch('http://localhost:3000/api/matlab/open_fuzzy', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        await Swal.close();

        if (response.ok) {
          const data = await response.json();
          console.log('Respuesta del servidor:', data);

          await Swal.fire({
            icon: 'success',
            title: '¡MATLAB se está abriendo!',
            html: `
              <div style="text-align: left;">
                <p><strong>Fuzzy Logic Toolbox se está iniciando...</strong></p>
                <p style="font-size: 0.9em; margin-top: 10px;">
                  ✓ Verifica tu escritorio<br>
                  ✓ Busca la ventana de MATLAB<br>
                  ✓ El toolbox puede tardar unos segundos en cargar
                </p>
              </div>
            `,
            confirmButtonText: 'Entendido',
            timer: 6000,
            timerProgressBar: true
          });
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));

          await Swal.fire({
            icon: 'error',
            title: 'Error del servidor',
            text: errorData.message || `Error ${response.status}: ${response.statusText}`,
            confirmButtonText: 'Cerrar'
          });
        }
      } catch (error) {
        await Swal.close();
        console.error('Error de conexión:', error);

        await Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor MATLAB.',
          footer: '<small>Verifica que el servidor esté ejecutándose en localhost:3000</small>',
          confirmButtonText: 'Cerrar'
        });
      }
    }
  }
};
</script>

<style scoped>
.light-theme .graph-editor-container { background-color: rgba(247, 243, 240, 1); color: #333; }
.dark-theme .graph-editor-container { background-color: rgba(44, 44, 44, 1); color: #e0e0e0; }

.title-card {
  background: #ffffff;
  padding: 1rem;
  border-radius: 20px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.fuzzy-container {
  width: 90vw;
  max-width: 1600px;
  /* aspect-ratio: 16 / 9; */
  display: flex;
  flex-direction: column;
  font-family: 'Oswald', sans-serif;
  transition: background-color 0.3s;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 40px;
}

.fuzzy-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px; /* Espacio para el navbar fijo */
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ac6ef8, #fc1361);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.main-title2 {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg,#fc1361, #ac6ef8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #c59cf8;
  border-bottom: 3px solid #c59cf8;
  padding-bottom: 0.5rem;
  display: inline-block;

}

/* Content Cards */
.content-card {
  background: #c59cf8;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  line-height: 1.6;
}

.content-card p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333333;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #fc1361;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

/* System Parts */
.system-parts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.part-item {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #c59cf8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.part-item h3 {
  color: #c59cf8;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

/* Applications Grid */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.app-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.app-card h3 {
  color: #fc1361;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.app-card ul {
  list-style-type: none;
  padding-left: 0;
}

.app-card li {
  padding: 0.3rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.app-card li:before {
  content: "•";
  color: #c59cf8;
  position: absolute;
  left: 0;
  font-size: 1.2rem;
}

/* Action Section */
.action-section {
  margin-top: 4rem;
  text-align: center;
}

.action-card {
  background: linear-gradient(135deg, var(--card-bg), rgba(197, 156, 248, 0.1));
  padding: 3rem;
  border-radius: 20px;
  border: 2px solid #c59cf8;
  box-shadow: 0 12px 40px rgba(197, 156, 248, 0.2);
}

.action-card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: black;
}

.action-card p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.matlab-button {
  background: linear-gradient(135deg, #ff6b9d, #c59cf8);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.3);
}

.matlab-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 107, 157, 0.4);
}

.button-icon {
  font-size: 1.4rem;
}

.button-arrow {
  font-size: 1.4rem;
  transition: transform 0.3s ease;
}

.matlab-button:hover .button-arrow {
  transform: translateX(5px);
}

.note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Theme Variables */
:root {
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --text-primary: #121212;
  --text-secondary: #666666;
}

.dark-theme {
  --card-bg: #1e1e1e;
  --border-color: #333333;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
}

.light-theme {
  --card-bg: #ffffff;
  --border-color: #e0e0e0;
  --text-primary: #121212;
  --text-secondary: #666666;
}

/* Responsive */
@media (max-width: 768px) {
  .fuzzy-content {
    padding: 1rem;
    padding-top: 70px;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .features-grid,
  .applications-grid {
    grid-template-columns: 1fr;
  }

  .action-card {
    padding: 2rem 1rem;
  }
}
</style>