<template>
  <div class="build-tree-view">
    <div class="layout">
      <div class="control-section">
        <TreeControlPanel
          :node-count="tree.nodeCount"
          :tree-height="tree.treeHeight"
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
      
      <div class="canvas-section">
        <TreeCanvas
          :tree="tree"
          :highlighted-nodes="highlightedNodes"
          ref="treeCanvas"
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
    handleExportTree() {
      const treeData = this.tree.toJSON();
      const dataStr = JSON.stringify(treeData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'arbol-binario.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
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
        case 'inOrder':
          traversalResult = this.tree.inOrder();
          break;
        case 'preOrder':
          traversalResult = this.tree.preOrder();
          break;
        case 'postOrder':
          traversalResult = this.tree.postOrder();
          break;
      }
      
      this.traversalResult = traversalResult.join(', ');
      
      const positions = this.tree.calculatePositions();
      const nodeIdsInOrder = [];
      
      const getNodeIdByValue = (value, node = this.tree.root) => {
        if (!node) return null;
        if (node.value === value) return node.id;
        
        const leftResult = getNodeIdByValue(value, node.left);
        if (leftResult) return leftResult;
        
        return getNodeIdByValue(value, node.right);
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
  height: 100%;
  padding: 20px;
  font-family: 'Oswald', sans-serif;
}

.layout {
  display: flex;
  height: 100%;
  gap: 25px;
}

.control-section {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 100%;
  overflow-y: auto;
}

.canvas-section {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

/* Scrollbar para la sección de controles */
.control-section::-webkit-scrollbar {
  width: 6px;
}

.control-section::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.control-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }
  
  .control-section {
    flex: 0 0 auto;
    max-height: 40vh;
  }
  
  .canvas-section {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .build-tree-view {
    padding: 15px;
  }
  
  .layout {
    gap: 15px;
  }
  
  .control-section {
    gap: 15px;
  }
}
</style>