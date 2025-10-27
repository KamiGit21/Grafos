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
          <span class="metric-label">Número de Nodos</span>
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
          <span class="metric-label">Altura del Árbol</span>
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
      
      <div class="metric-card" v-if="hasNodes">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
          </svg>
        </div>
        <div class="metric-info">
          <span class="metric-label">Nivel Actual</span>
          <span class="metric-value">{{ currentLevel }}</span>
        </div>
      </div>
    </div>
    
    <div class="additional-info" v-if="hasNodes">
      <h4>Información Adicional</h4>
      <div class="info-grid">
        <div class="info-item">
          <span>Mínimo:</span>
          <strong>{{ minValue }}</strong>
        </div>
        <div class="info-item">
          <span>Máximo:</span>
          <strong>{{ maxValue }}</strong>
        </div>
        <div class="info-item">
          <span>Promedio:</span>
          <strong>{{ averageValue.toFixed(2) }}</strong>
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
      if (!this.tree || !this.tree.root) return true;
      return this.checkBalance(this.tree.root) !== -1;
    },
    currentLevel() {
      return this.treeHeight >= 0 ? this.treeHeight : 0;
    },
    minValue() {
      if (!this.tree || !this.tree.root) return '-';
      return this.findMinValue(this.tree.root);
    },
    maxValue() {
      if (!this.tree || !this.tree.root) return '-';
      return this.findMaxValue(this.tree.root);
    },
    averageValue() {
      if (!this.tree || !this.tree.root) return 0;
      const values = this.getAllValues(this.tree.root);
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
  },
  methods: {
    checkBalance(node) {
      if (!node) return 0;
      
      const leftHeight = this.checkBalance(node.left);
      if (leftHeight === -1) return -1;
      
      const rightHeight = this.checkBalance(node.right);
      if (rightHeight === -1) return -1;
      
      if (Math.abs(leftHeight - rightHeight) > 1) return -1;
      
      return Math.max(leftHeight, rightHeight) + 1;
    },
    findMinValue(node) {
      while (node.left !== null) {
        node = node.left;
      }
      return node.value;
    },
    findMaxValue(node) {
      while (node.right !== null) {
        node = node.right;
      }
      return node.value;
    },
    getAllValues(node, values = []) {
      if (node !== null) {
        this.getAllValues(node.left, values);
        values.push(node.value);
        this.getAllValues(node.right, values);
      }
      return values;
    }
  }
};
</script>

<style scoped>
.tree-metrics {
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2d3748;
  text-align: center;
  font-size: 1.1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.metric-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  border-radius: 6px;
  margin-right: 0.75rem;
  color: white;
}

.metric-icon svg {
  width: 1rem;
  height: 1rem;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.7rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.additional-info {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.additional-info h4 {
  margin: 0 0 0.75rem 0;
  color: #4a5568;
  font-size: 0.9rem;
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.info-item span {
  font-size: 0.7rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.info-item strong {
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 600;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .info-item {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem;
  }
  
  .info-item span {
    margin-bottom: 0;
  }
}
</style>