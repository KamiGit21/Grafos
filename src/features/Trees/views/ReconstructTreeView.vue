<template>
  <div class="reconstruct-tree-view">
    <div class="layout">
      <div class="control-section">
        <TreeReconstructionForm
          @reconstruct-tree="handleReconstructTree"
          @reset-tree="handleResetTree"
          @export-tree="handleExportTree"
          @import-tree="handleImportTree"
        />
      </div>
      
      <div class="canvas-section">
        <TreeCanvas
          :tree="tree"
          :highlighted-nodes="[]"
          ref="treeCanvas"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { BinarySearchTree } from '../utils/trees.js';
import TreeReconstructionForm from '../components/TreeReconstructionForm.vue';
import TreeCanvas from '../components/TreeCanvas.vue';

export default {
  name: 'ReconstructTreeView',
  components: {
    TreeReconstructionForm,
    TreeCanvas
  },
  data() {
    return {
      tree: new BinarySearchTree()
    };
  },
  methods: {
    handleReconstructTree({ method, inOrder, otherOrder }) {
      try {
        if (method === 'inPre') {
          this.tree.root = this.buildTreeFromInPre(inOrder, otherOrder);
        } else {
          this.tree.root = this.buildTreeFromInPost(inOrder, otherOrder);
        }
        this.tree.nodeCount = inOrder.length;
        this.tree.updateHeight();
        this.$forceUpdate();
      } catch (error) {
        alert('Error al reconstruir el árbol: ' + error.message);
      }
    },

    // ✅ MÉTODOS DE RECONSTRUCCIÓN
    buildTreeFromInPre(inOrder, preOrder) {
      if (!inOrder.length || !preOrder.length) return null;
      const rootValue = preOrder[0];
      const root = new TreeNode(rootValue);
      const rootIndex = inOrder.indexOf(rootValue);
      if (rootIndex === -1) throw new Error('Recorridos inconsistentes');
      
      const inLeft = inOrder.slice(0, rootIndex);
      const inRight = inOrder.slice(rootIndex + 1);
      const preLeft = preOrder.slice(1, 1 + inLeft.length);
      const preRight = preOrder.slice(1 + inLeft.length);
      
      root.left = this.buildTreeFromInPre(inLeft, preLeft);
      root.right = this.buildTreeFromInPre(inRight, preRight);
      return root;
    },

    buildTreeFromInPost(inOrder, postOrder) {
      if (!inOrder.length || !postOrder.length) return null;
      const rootValue = postOrder[postOrder.length - 1];
      const root = new TreeNode(rootValue);
      const rootIndex = inOrder.indexOf(rootValue);
      if (rootIndex === -1) throw new Error('Recorridos inconsistentes');
      
      const inLeft = inOrder.slice(0, rootIndex);
      const inRight = inOrder.slice(rootIndex + 1);
      const postLeft = postOrder.slice(0, inLeft.length);
      const postRight = postOrder.slice(inLeft.length, -1);
      
      root.left = this.buildTreeFromInPost(inLeft, postLeft);
      root.right = this.buildTreeFromInPost(inRight, postRight);
      return root;
    },

    handleResetTree() {
      this.tree.clear();
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
    }
  }
};
</script>

<style scoped>
.reconstruct-tree-view {
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
}

.canvas-section {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }
  .control-section {
    flex: 0 0 auto;
  }
  .canvas-section {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .reconstruct-tree-view {
    padding: 15px;
  }
  .layout {
    gap: 15px;
  }
}
</style>