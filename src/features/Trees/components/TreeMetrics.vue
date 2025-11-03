<template>
  <div class="tree-metrics">
    <h3>Métricas del Árbol</h3>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17,10H7V8H17M17,13H7V11H17M17,16H7V14H17M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Nodos</span>
          <span class="metric-value">{{ nodeCount }}</span>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Altura</span>
          <span class="metric-value">{{ treeHeight }}</span>
        </div>
      </div>
      
      <div class="metric-card" v-if="hasNodes">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.5,8L11,13.5L7.5,10L6,11.5L11,16.5Z"/>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Balanceado</span>
          <span class="metric-value">{{ isBalanced ? 'Sí' : 'No' }}</span>
        </div>
      </div>
    </div>
    
    <div class="additional-info" v-if="hasNodes">
      <h4>Valores BST</h4>
      <div class="info-grid">
        <div class="info-item">
          <span>Mínimo:</span>
          <strong>{{ minValue }}</strong>
        </div>
        <div class="info-item">
          <span>Máximo:</span>
          <strong>{{ maxValue }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeMetrics',
  props: {
    nodeCount: {
      type: Number,
      default: 0
    },
    treeHeight: {
      type: Number,
      default: -1
    },
    tree: {
      type: Object,
      default: null
    }
  },
  computed: {
    hasNodes() {
      return this.nodeCount > 0;
    },
    isBalanced() {
      return this.tree?.isBalanced ? this.tree.isBalanced() : false;
    },
    minValue() {
      return this.tree?.findMinValue ? this.tree.findMinValue() : '-';
    },
    maxValue() {
      return this.tree?.findMaxValue ? this.tree.findMaxValue() : '-';
    }
  }
};
</script>

<style scoped>
.tree-metrics {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 16px;
  border: 2px solid #805ad5;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Oswald', sans-serif;
  backdrop-filter: blur(10px);
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #2d3748;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.metric-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #805ad5, #6b46c1);
  border-radius: 6px;
  margin-right: 10px;
  color: white;
}

.metric-icon svg {
  width: 16px;
  height: 16px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.metric-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.additional-info {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
}

.additional-info h4 {
  margin: 0 0 10px 0;
  color: #4a5568;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background-color: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.info-item span {
  font-size: 0.7rem;
  color: #718096;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-item strong {
  font-size: 0.85rem;
  color: #2d3748;
  font-weight: 600;
}

@media (max-width: 900px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
  }
  
  .info-item span {
    margin-bottom: 0;
  }
}
</style>