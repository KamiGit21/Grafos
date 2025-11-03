<template>
  <div class="build-tree-view">
    <div class="layout">
      <!-- Panel izquierdo: Controles principales (MÁS COMPACTO) -->
      <div class="left-panel">
        <div class="panel-content">
          <TreeControlPanel
            :node-count="tree.nodeCount"
            :tree-height="tree.treeHeight"
            :existing-values="existingValues"
            @insert-node="handleInsertNode"
            @remove-last-node="handleRemoveLastNode"
            @reset-tree="handleResetTree"
            @export-tree="handleExportTree"
            @import-tree="handleImportTree"
          />
        </div>
      </div>
      
      <!-- Centro: Pizarra del árbol (MÁXIMO ESPACIO) -->
      <div class="center-panel">
        <TreeCanvas
          :tree="tree"
          :highlighted-nodes="highlightedNodes"
          ref="treeCanvas"
        />
      </div>
      
      <!-- Panel derecho: Métricas y recorridos (MÁS COMPACTO) -->
      <div class="right-panel">
        <div class="panel-content">
          <TreeMetrics
            :node-count="tree.nodeCount"
            :tree-height="tree.treeHeight"
            :tree="tree"
          />
          
          <TreeAnimationControls
            :has-nodes="tree.nodeCount > 0"
            :is-animating="isAnimating"
            :traversal-result="traversalResult"
            :current-step="currentAnimationStep"
            @start-animation="startTraversalAnimation"
            @stop-animation="stopTraversalAnimation"
            @update-speed="updateAnimationSpeed"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BinarySearchTree } from '../utils/trees.js';
import TreeControlPanel from '../components/TreeControlPanel.vue';
import TreeMetrics from '../components/TreeMetrics.vue';
import TreeAnimationControls from '../components/TreeAnimationControls.vue';
import TreeCanvas from '../components/TreeCanvas.vue';

export default {
  name: 'BuildTreeView',
  components: {
    TreeControlPanel,
    TreeMetrics,
    TreeAnimationControls,
    TreeCanvas
  },
  data() {
    return {
      tree: new BinarySearchTree(),
      isAnimating: false,
      highlightedNodes: [],
      animationInterval: null,
      traversalResult: '',
      currentAnimationStep: -1,
      animationSpeed: 800
    };
  },
  computed: {
    existingValues() {
      if (!this.tree.root) return [];
      const values = [];
      const traverse = (node) => {
        if (!node) return;
        traverse(node.left);
        values.push(node.value);
        traverse(node.right);
      };
      traverse(this.tree.root);
      return values;
    }
  },
  methods: {
    handleInsertNode(value) {
      this.tree.insert(value);
      this.$forceUpdate();
    },
    handleRemoveLastNode() {
      this.tree.removeLast();
      this.$forceUpdate();
    },
    handleResetTree() {
      this.tree.clear();
      this.stopTraversalAnimation();
      this.$forceUpdate();
    },
    handleExportTree(fileName) {
      const treeData = this.tree.toJSON();
      const dataStr = JSON.stringify(treeData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName + '.json');
      linkElement.click();
    },
    handleImportTree(treeData) {
      this.tree.fromJSON(treeData);
      this.$forceUpdate();
    },
    async startTraversalAnimation({ traversal, speed }) {
      this.stopTraversalAnimation();
      this.isAnimating = true;
      this.animationSpeed = speed;
      
      let traversalResult = [];
      switch (traversal) {
        case 'inOrder': traversalResult = this.tree.inOrder(); break;
        case 'preOrder': traversalResult = this.tree.preOrder(); break;
        case 'postOrder': traversalResult = this.tree.postOrder(); break;
      }
      
      this.traversalResult = traversalResult.join(', ');
      
      const nodeIdsInOrder = [];
      const getNodeIdByValue = (value, node = this.tree.root) => {
        if (!node) return null;
        if (node.value === value) return node.id;
        return getNodeIdByValue(value, node.left) || getNodeIdByValue(value, node.right);
      };
      
      for (const value of traversalResult) {
        const nodeId = getNodeIdByValue(value);
        if (nodeId) nodeIdsInOrder.push(nodeId);
      }
      
      let currentIndex = 0;
      this.currentAnimationStep = -1;
      
      this.animationInterval = setInterval(() => {
        if (currentIndex < nodeIdsInOrder.length) {
          this.highlightedNodes = [nodeIdsInOrder[currentIndex]];
          this.currentAnimationStep = currentIndex;
          currentIndex++;
        } else {
          this.stopTraversalAnimation();
        }
      }, this.animationSpeed);
    },
    stopTraversalAnimation() {
      this.isAnimating = false;
      this.highlightedNodes = [];
      this.currentAnimationStep = -1;
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
    },
    updateAnimationSpeed(speed) {
      this.animationSpeed = speed;
      if (this.isAnimating && this.animationInterval) {
        clearInterval(this.animationInterval);
        this.startTraversalAnimation({
          traversal: this.selectedTraversal,
          speed: this.animationSpeed
        });
      }
    }
  },
  beforeDestroy() {
    this.stopTraversalAnimation();
  }
};
</script>

<style scoped>
.build-tree-view {
  height: 100vh;
  padding: 12px;
  font-family: 'Oswald', sans-serif;
  background: linear-gradient(135deg, #fefaf6 0%, #f8f4f0 100%);
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px; /* Paneles más compactos */
  gap: 15px; /* Menor gap */
  height: calc(100vh - 24px);
  max-height: calc(100vh - 24px);
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0;
}

.center-panel {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
  height: 100%;
  min-height: 500px;
  /* La pizarra ahora ocupa mucho más espacio relativo */
}

/* Scrollbar personalizado para paneles */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 3px;
  margin: 4px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

/* Asegurar que los componentes internos se expandan correctamente */
.panel-content > * {
  flex-shrink: 0;
}

/* Espaciado entre componentes en los paneles */
.panel-content > * + * {
  margin-top: 0;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 260px 1fr 260px;
    gap: 12px;
  }
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 240px 1fr 240px;
    gap: 10px;
  }
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 12px;
    height: auto;
    min-height: calc(100vh - 24px);
  }
  
  .left-panel,
  .right-panel {
    max-height: 280px;
  }
  
  .center-panel {
    min-height: 450px;
    order: 2;
  }
  
  .left-panel {
    order: 1;
  }
  
  .right-panel {
    order: 3;
  }
}

@media (max-width: 768px) {
  .build-tree-view {
    padding: 8px;
  }
  
  .layout {
    gap: 8px;
  }
  
  .left-panel,
  .right-panel {
    max-height: 220px;
  }
  
  .center-panel {
    min-height: 400px;
  }
}
</style>