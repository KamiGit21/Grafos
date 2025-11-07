<template>
  <div class="kruskal-modal-overlay" @click.self="closeModal">
    <div :class="['kruskal-modal-content', theme]">
      <header class="kruskal-modal-header">
        <h2>Algoritmo de Kruskal (Mínimo)</h2>
        <button class="close-button" @click="closeModal" title="Cerrar">×</button>
      </header>

      <main class="kruskal-modal-body" v-if="nodes.length > 0 && edges.length > 0">
        <div class="info-panel">
          <p><strong>Peso total del árbol mínimo:</strong> {{ totalWeight }}</p>
        </div>

        <svg class="graph-svg" ref="graphSvg" @wheel.prevent="handleWheel" @mousedown.self="startPan"
          @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
          <g :transform="`translate(${panX}, ${panY}) scale(${zoomLevel})`">

            <!-- Definiciones -->
            <defs>
              <marker id="circle-end" markerWidth="6" markerHeight="6" refX="3" refY="3">
                <circle cx="3" cy="3" r="3" :fill="edgeDefaultColor" />
              </marker>
            </defs>

            <!-- Aristas -->
            <g v-for="edge in edgesWithCoords" :key="edge.id">
              <line :x1="edge.x1" :y1="edge.y1" :x2="edge.x2" :y2="edge.y2"
                :stroke="edge.isInMST ? '#dc2626' : edgeDefaultColor" :stroke-width="edge.isInMST ? '4' : '2'" />

              <text :x="(edge.x1 + edge.x2) / 2" :y="(edge.y1 + edge.y2) / 2 - 5" text-anchor="middle"
                class="edge-label">
                {{ edge.weight }}
              </text>
            </g>

            <!-- Nodos -->
            <g v-for="node in nodes" :key="node.id" :transform="`translate(${node.x}, ${node.y})`">
              <circle :r="20" :fill="node.isInMST ? '#fecaca' : node.color"
                :stroke="node.isInMST ? '#dc2626' : node.borderColor" :stroke-width="node.isInMST ? 3 : 2" />
              <text text-anchor="middle" y="5" class="node-label">{{ node.label }}</text>
            </g>
          </g>
        </svg>
      </main>

      <main v-else class="kruskal-modal-body">
        <p>El grafo está vacío. Agrega nodos y aristas no dirigidas con pesos numéricos.</p>
      </main>

      <footer class="kruskal-modal-footer">
        <button @click="exportJSON" class="footer-btn">Exportar JSON</button>
        <button @click="triggerImportJSON" class="footer-btn">Importar JSON</button>
        <input type="file" ref="importFileInput" @change="importJSON" accept=".json" style="display: none;" />
        <button @click="clearAndClose" class="footer-btn danger-btn">Eliminar todo y cerrar</button>
        <button @click="closeModal" class="footer-btn primary-btn">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['close', 'update-graph', 'clear-graph']);

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  theme: { type: String, default: 'light' },
})

const closeModal = () => {
  emit('close');
};

const { nodes, edges, theme } = props

// --- Estados gráficos ---
const panX = ref(0)
const panY = ref(0)
const zoomLevel = ref(1)
const edgeDefaultColor = '#555'

// --- Aristas con coordenadas ---
const edgesWithCoords = computed(() => {
  return edges.map(e => {
    const srcId = e.source ?? e.from
    const tgtId = e.target ?? e.to
    const src = nodes.find(n => n.id === srcId)
    const tgt = nodes.find(n => n.id === tgtId)
    return {
      ...e,
      source: srcId,
      target: tgtId,
      weight: Number(e.weight ?? e.value ?? 0),
      x1: src?.x ?? 0,
      y1: src?.y ?? 0,
      x2: tgt?.x ?? 0,
      y2: tgt?.y ?? 0
    }
  })
})

// --- Lógica de Kruskal ---
const mstEdges = ref([])
const totalWeight = ref(0)

watch([edges, nodes], () => runKruskal(), { immediate: true })

function runKruskal() {
  mstEdges.value = []
  totalWeight.value = 0
  const parent = {}
  nodes.forEach(n => parent[n.id] = n.id)

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }
  function union(a, b) {
    const pa = find(a)
    const pb = find(b)
    if (pa !== pb) parent[pb] = pa
  }

  const sortedEdges = [...edges]
    .map(e => ({
      ...e,
      source: e.source ?? e.from,
      target: e.target ?? e.to,
      weight: Number(e.weight ?? e.value ?? 0)
    }))
    .filter(e => e.source !== e.target)
    .sort((a, b) => a.weight - b.weight)

  for (const e of sortedEdges) {
    if (find(e.source) !== find(e.target)) {
      mstEdges.value.push(e)
      totalWeight.value += e.weight
      union(e.source, e.target)
    }
  }

  // marcar visualmente
  edges.forEach(e => {
    const src = e.source ?? e.from
    const tgt = e.target ?? e.to
    e.isInMST = mstEdges.value.some(me =>
      (me.source === src && me.target === tgt) ||
      (me.source === tgt && me.target === src)
    )
  })
  nodes.forEach(n => {
    n.isInMST = mstEdges.value.some(e => e.source === n.id || e.target === n.id)
  })

}

// --- Zoom y Pan ---
function handleWheel(event) {
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoomLevel.value = Math.min(Math.max(zoomLevel.value * delta, 0.5), 2)
}
function startPan(e) { start.x = e.clientX; start.y = e.clientY; dragging.value = true }
function onDrag(e) {
  if (!dragging.value) return
  panX.value += e.clientX - start.x
  panY.value += e.clientY - start.y
  start.x = e.clientX
  start.y = e.clientY
}
function stopDrag() { dragging.value = false }

const start = { x: 0, y: 0 }
const dragging = ref(false)

// --- Exportar / Importar / Limpiar ---
const importFileInput = ref(null)

function exportJSON() {
  const data = { nodes, edges }


  const fileName = prompt("Ingresa el nombre del archivo para guardar:", "grafo_kruskal");
  if (!fileName) return;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName.trim()}.json`;
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImportJSON() {
  importFileInput.value?.click()
}

function importJSON(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    const data = JSON.parse(ev.target.result)
    nodes.splice(0, nodes.length, ...data.nodes)
    edges.splice(0, edges.length, ...data.edges)
  }
  reader.readAsText(file)
}

const clearAndClose = () => {
  nodes.splice(0)
  edges.splice(0)
  if (confirm("¿Estás seguro de que quieres borrar todo el grafo? Esta acción no se puede deshacer.")) {
    emit('clear-graph');
    closeModal();
  }
};
</script>


<style scoped>
.node-slack-label {
  font-size: 12px;
  fill: v-bind('theme === "light-theme" ? "#1a73e8" : "#8ab4f8"');
  pointer-events: none;
}

.kruskal-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.281);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.kruskal-modal-content {
  width: 90%;
  height: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.kruskal-modal-body p {
  color: #2c2c2c;
}

.dark-theme .kruskal-modal-body p {
  color: #e0e0e0;
}

.light-theme .kruskal-modal-content {
  background: linear-gradient(180deg, rgba(253, 246, 236, 0.98) 0%, rgba(248, 238, 226, 0.95) 100%);
  border: 2px solid #c9a887;
}

.dark-theme .kruskal-modal-content {
  background: linear-gradient(180deg, rgba(44, 44, 44, 0.98) 0%, rgba(35, 35, 35, 0.95) 100%);
  border: 2px solid #242a31;
}

.kruskal-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  flex-shrink: 0;
}

.light-theme .kruskal-modal-header {
  background: rgba(255, 249, 242, 0.9);
  border-bottom: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .kruskal-modal-header {
  background: rgba(58, 58, 58, 0.9);
  border-bottom: 1px solid #555;
}

.kruskal-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.light-theme .kruskal-modal-header h2 {
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .kruskal-modal-header h2 {
  background: linear-gradient(135deg, #c9b4a4 0%, #e0c9b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  transition: all 0.3s ease;
}

.light-theme .close-button {
  color: #888;
}

.dark-theme .close-button {
  color: #bbb;
}

.close-button:hover {
  transform: rotate(90deg);
}

.light-theme .close-button:hover {
  color: #000;
}

.dark-theme .close-button:hover {
  color: #fff;
}

/* Body */
.kruskal-modal-body {
  flex-grow: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.dark-theme .kruskal-modal-body {
  background-color: #333;
}

/* Info Panel */
.info-panel {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.light-theme .info-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(224, 201, 182, 0.4);
  color: #333;
}

.dark-theme .info-panel {
  background: rgba(58, 58, 58, 0.95);
  border: 1px solid #555;
  color: #e0e0e0;
}

.info-panel p {
  margin: 6px 0;
}

.warning-text {
  color: #f59e0b;
  font-weight: 600;
}

/* SVG Graph */
.graph-svg {
  flex-grow: 1;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: grab;
}

.graph-svg:active {
  cursor: grabbing;
}

.light-theme .graph-svg {
  background-color: #ffffff;
  border: 2px solid #c9a887;
}

.dark-theme .graph-svg {
  background-color: #2a2a2a;
  border: 2px solid #3a4b5f;
}

/* Edge Labels */
.edge-label {
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.light-theme .edge-label {
  fill: #333;
}

.dark-theme .edge-label {
  fill: #e0e0e0;
}

.edge-slack-label {
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}

.light-theme .edge-slack-label {
  fill: #1a73e8;
}

.dark-theme .edge-slack-label {
  fill: #8ab4f8;
}

/* Node Labels */
.node-label {
  font-weight: bold;
  pointer-events: none;
}

.light-theme .node-label {
  fill: #000;
}

.dark-theme .node-label {
  fill: #fff;
}

.node-slack-label {
  font-size: 12px;
  pointer-events: none;
}

.light-theme .node-slack-label {
  fill: #1a73e8;
}

.dark-theme .node-slack-label {
  fill: #8ab4f8;
}

.node-group {
  pointer-events: none;
}

/* Camino Máximo (Crítico) */
.max-path {
  stroke: rgba(37, 100, 235) !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.5));
  animation: pulse-path 2s ease-in-out infinite;
}

@keyframes pulse-path {

  0%,
  100% {
    stroke-opacity: 1;
  }

  50% {
    stroke-opacity: 0.7;
  }
}

.max-path-node circle,
.max-path-node ellipse {
  stroke: rgba(37, 100, 235) !important;
  stroke-width: 3 !important;
  filter: drop-shadow(0 0 6px rgba(37, 100, 235, 0.4));
}

/* Footer */
.kruskal-modal-footer {
  padding: 15px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.light-theme .kruskal-modal-footer {
  background: rgba(255, 249, 242, 0.9);
  border-top: 1px solid rgba(224, 201, 182, 0.3);
}

.dark-theme .kruskal-modal-footer {
  background: rgba(58, 58, 58, 0.9);
  border-top: 1px solid #555;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid;
  position: relative;
  overflow: hidden;
}

.footer-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.footer-btn:hover::before {
  left: 100%;
}

.footer-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.footer-btn:hover svg {
  transform: scale(1.1);
}

.light-theme .footer-btn {
  background: rgba(255, 249, 242, 0.9);
  border-color: rgba(224, 201, 182, 0.5);
  color: #8b7355;
}

.dark-theme .footer-btn {
  background: rgba(58, 58, 58, 0.9);
  border-color: rgba(70, 70, 70, 0.5);
  color: #c9b4a4;
}

.light-theme .footer-btn:hover {
  background: rgba(243, 232, 221, 0.95);
  border-color: rgba(201, 168, 135, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
}

.dark-theme .footer-btn:hover {
  background: rgba(74, 74, 74, 0.95);
  border-color: rgba(139, 115, 85, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 180, 164, 0.15);
}

.primary-btn {
  background: linear-gradient(135deg, #8b7355 0%, #c9a887 100%) !important;
  border-color: #a08970 !important;
  color: white !important;
}

.light-theme .primary-btn:hover {
  background: linear-gradient(135deg, #7a6449 0%, #b89776 100%) !important;
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
}

.dark-theme .primary-btn {
  background: linear-gradient(135deg, #c9b4a4 0%, #e0c9b6 100%) !important;
  border-color: #d4baaa !important;
  color: #2a2a2a !important;
}

.dark-theme .primary-btn:hover {
  background: linear-gradient(135deg, #b8a394 0%, #cfb8a6 100%) !important;
}

.danger-btn {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
  border-color: #b91c1c !important;
  color: white !important;
}

.danger-btn:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%) !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .kruskal-modal-content {
    width: 95%;
    height: 95%;
  }

  .kruskal-modal-header h2 {
    font-size: 1.2rem;
  }

  .footer-btn span {
    display: none;
  }

  .footer-btn {
    padding: 10px;
  }

  .info-panel {
    font-size: 12px;
  }
}
</style>
