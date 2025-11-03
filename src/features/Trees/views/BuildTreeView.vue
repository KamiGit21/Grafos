<template>
  <div class="build-tree-view">
    <div class="layout">
      <!-- Panel izquierdo: Controles y métricas -->
      <div class="left-panel">
        <TreeControlPanel
          :node-count="tree.nodeCount"
          :tree-height="tree.treeHeight"
<<<<<<< HEAD
          :is-complete="isTreeComplete"
=======
          :existing-values="existingValues"
>>>>>>> origin/main
          @insert-node="handleInsertNode"
          @remove-last-node="handleRemoveLastNode"
          @reset-tree="handleResetTree"
          @export-tree="handleExportTree"
          @import-tree="handleImportTree"
        />
        
        <TreeMetrics
          :node-count="tree.nodeCount"
          :tree-height="tree.treeHeight"
          :tree="tree"
          :is-complete="isTreeComplete"
        />
      </div>
      
      <!-- Panel central: Canvas del árbol -->
      <div class="center-panel">
        <TreeCanvas
          :tree="tree"
          :highlighted-nodes="highlightedNodes"
          ref="treeCanvas"
        />
      </div>
      
      <!-- Panel derecho: Controles de animación -->
      <div class="right-panel">
        <TreeAnimationControls
          :has-nodes="tree.nodeCount > 0"
          :is-complete="isTreeComplete"
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
<<<<<<< HEAD
    isTreeComplete() {
      return this.tree.isComplete();
=======
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
>>>>>>> origin/main
    }
  },
  methods: {
    handleInsertNode(value) {
      try {
        this.tree.insert(value);
        this.$forceUpdate();
      } catch (error) {
        alert(error.message);
      }
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
<<<<<<< HEAD
    
    handleExportTree() {
=======
    handleExportTree(fileName) {
>>>>>>> origin/main
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
      if (!this.isTreeComplete) {
        alert('No se puede iniciar el recorrido. El árbol debe ser completo (todos los niveles deben estar llenos excepto posiblemente el último nivel).');
        return;
      }
      
      this.stopTraversalAnimation();
      this.isAnimating = true;
      this.animationSpeed = speed;
      
<<<<<<< HEAD
      try {
        const { values, nodeIds } = this.getTraversalWithNodeIds(traversal);
        
        this.traversalResult = values.join(', ');
        
        let currentIndex = 0;
        this.currentAnimationStep = -1;
        this.highlightedNodes = [];
        
        this.animationInterval = setInterval(() => {
          if (currentIndex < nodeIds.length) {
            this.highlightedNodes = [nodeIds[currentIndex]];
            this.currentAnimationStep = currentIndex;
            currentIndex++;
          } else {
            this.stopTraversalAnimation();
          }
        }, this.animationSpeed);
        
      } catch (error) {
        console.error('Error en animación:', error);
        this.stopTraversalAnimation();
=======
      let traversalResult = [];
      switch (traversal) {
        case 'inOrder': traversalResult = this.tree.inOrder(); break;
        case 'preOrder': traversalResult = this.tree.preOrder(); break;
        case 'postOrder': traversalResult = this.tree.postOrder(); break;
>>>>>>> origin/main
      }
    },

    getTraversalWithNodeIds(traversalType) {
      const values = [];
      const nodeIds = [];
      
<<<<<<< HEAD
      const inOrder = (node) => {
        if (!node) return;
        inOrder(node.left);
        values.push(node.value);
        nodeIds.push(node.id);
        inOrder(node.right);
=======
      this.traversalResult = traversalResult.join(', ');
      
      const nodeIdsInOrder = [];
      const getNodeIdByValue = (value, node = this.tree.root) => {
        if (!node) return null;
        if (node.value === value) return node.id;
        return getNodeIdByValue(value, node.left) || getNodeIdByValue(value, node.right);
>>>>>>> origin/main
      };
      
      const preOrder = (node) => {
        if (!node) return;
        values.push(node.value);
        nodeIds.push(node.id);
        preOrder(node.left);
        preOrder(node.right);
      };
      
      const postOrder = (node) => {
        if (!node) return;
        postOrder(node.left);
        postOrder(node.right);
        values.push(node.value);
        nodeIds.push(node.id);
      };
      
      switch (traversalType) {
        case 'inOrder':
          inOrder(this.tree.root);
          break;
        case 'preOrder':
          preOrder(this.tree.root);
          break;
        case 'postOrder':
          postOrder(this.tree.root);
          break;
        default:
          throw new Error(`Tipo de recorrido no válido: ${traversalType}`);
      }
      
      return { values, nodeIds };
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
        const currentTraversal = document.querySelector('.traversal-select')?.value || 'inOrder';
        this.startTraversalAnimation({
          traversal: currentTraversal,
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
  padding: 20px;
  font-family: 'Oswald', sans-serif;
  background: linear-gradient(135deg, #fefaf6 0%, #f8f4f0 100%);
}

.layout {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 20px;
  height: 100%;
  max-height: 800px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.center-panel {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 600px;
}

<<<<<<< HEAD
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* Scrollbar personalizado */
.left-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
=======
.control-section::-webkit-scrollbar {
>>>>>>> origin/main
  width: 6px;
}

.left-panel::-webkit-scrollbar-track,
.right-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.left-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 300px 1fr;
    grid-template-rows: auto 1fr;
    gap: 15px;
  }
<<<<<<< HEAD
  
  .right-panel {
    grid-column: 1 / -1;
    grid-row: 2;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .right-panel > * {
    flex: 1;
    min-width: 300px;
=======
  .control-section {
    flex: 0 0 auto;
    max-height: 40vh;
  }
  .canvas-section {
    min-height: 400px;
>>>>>>> origin/main
  }
}

@media (max-width: 768px) {
  .build-tree-view {
    padding: 10px;
  }
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 15px;
  }
<<<<<<< HEAD
  
  .left-panel,
  .center-panel,
  .right-panel {
    grid-column: 1;
  }
  
  .center-panel {
    min-height: 400px;
  }
  
  .right-panel {
    flex-direction: column;
=======
  .control-section {
    gap: 15px;
>>>>>>> origin/main
  }
}
</style>