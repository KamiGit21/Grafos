export class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.id = Date.now() + Math.random();
  }
}

export class BinarySearchTree {
  constructor() {
    this.root = null;
    this.nodeCount = 0;
    this.treeHeight = -1;
    this.insertionOrder = [];
    this.valuesSet = new Set();
  }

  insert(value) {
    if (this.valuesSet.has(value)) {
      throw new Error(`El valor ${value} ya existe en el árbol. No se permiten valores duplicados.`);
    }
    
    const newNode = new TreeNode(value);
    
    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertLevelOrder(newNode);
    }
    
    this.nodeCount++;
    this.insertionOrder.push(newNode.id);
    this.valuesSet.add(value);
    this.updateHeight();
    return newNode;
  }

  insertLevelOrder(newNode) {
    const queue = [this.root];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      // Si no tiene hijo izquierdo, insertar aquí
      if (current.left === null) {
        current.left = newNode;
        return;
      } else {
        queue.push(current.left);
      }
      
      // Si no tiene hijo derecho, insertar aquí
      if (current.right === null) {
        current.right = newNode;
        return;
      } else {
        queue.push(current.right);
      }
    }
  }

  // Método auxiliar para encontrar la posición del siguiente nodo a insertar
  findNextInsertPosition() {
    if (!this.root) return null;
    
    const queue = [this.root];
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.left === null || current.right === null) {
        return current;
      }
      
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
    return null;
  }

  removeLast() {
    if (this.root === null || this.insertionOrder.length === 0) return null;
    
    const lastNodeId = this.insertionOrder.pop();
    let removedValue = null;
    
    if (lastNodeId === this.root.id) {
      removedValue = this.root.value;
      this.root = null;
    } else {
      removedValue = this.removeLastNode(this.root, lastNodeId);
    }
    
    if (removedValue !== null) {
      this.nodeCount--;
      this.valuesSet.delete(removedValue);
    }
    
    this.updateHeight();
    return lastNodeId;
  }

  removeLastNode(node, targetId) {
    if (!node) return null;
    
    if (node.left && node.left.id === targetId) {
      const value = node.left.value;
      node.left = null;
      return value;
    }
    if (node.right && node.right.id === targetId) {
      const value = node.right.value;
      node.right = null;
      return value;
    }
    
    const leftResult = this.removeLastNode(node.left, targetId);
    if (leftResult !== null) return leftResult;
    
    return this.removeLastNode(node.right, targetId);
  }

  updateHeight() {
    this.treeHeight = this.calculateHeight(this.root);
  }

  calculateHeight(node) {
    if (node === null) return -1;
    const leftHeight = this.calculateHeight(node.left);
    const rightHeight = this.calculateHeight(node.right);
    return Math.max(leftHeight, rightHeight) + 1;
  }

  isComplete() {
    if (!this.root) return true;
    
    const queue = [this.root];
    let foundNull = false;
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current === null) {
        foundNull = true;
      } else {
        if (foundNull) return false;
        queue.push(current.left);
        queue.push(current.right);
      }
    }
    
    return true;
  }

  // Recorridos
  inOrder(node = this.root, result = []) {
    if (node !== null) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }

  preOrder(node = this.root, result = []) {
    if (node !== null) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
    return result;
  }

  postOrder(node = this.root, result = []) {
    if (node !== null) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  levelOrder() {
    const result = [];
    if (!this.root) return result;
    
    const queue = [this.root];
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current.value);
      
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
    return result;
  }

  buildTreeFromInPre(inOrder, preOrder) {
    if (inOrder.length === 0) return null;
    
    const rootValue = preOrder[0];
    const root = new TreeNode(rootValue);
    
    const rootIndex = inOrder.indexOf(rootValue);
    const leftInOrder = inOrder.slice(0, rootIndex);
    const rightInOrder = inOrder.slice(rootIndex + 1);
    const leftPreOrder = preOrder.slice(1, 1 + leftInOrder.length);
    const rightPreOrder = preOrder.slice(1 + leftInOrder.length);
    
    root.left = this.buildTreeFromInPre(leftInOrder, leftPreOrder);
    root.right = this.buildTreeFromInPre(rightInOrder, rightPreOrder);
    
    return root;
  }

  buildTreeFromInPost(inOrder, postOrder) {
    if (inOrder.length === 0) return null;
    
    const rootValue = postOrder[postOrder.length - 1];
    const root = new TreeNode(rootValue);
    
    const rootIndex = inOrder.indexOf(rootValue);
    const leftInOrder = inOrder.slice(0, rootIndex);
    const rightInOrder = inOrder.slice(rootIndex + 1);
    const leftPostOrder = postOrder.slice(0, leftInOrder.length);
    const rightPostOrder = postOrder.slice(leftInOrder.length, -1);
    
    root.left = this.buildTreeFromInPost(leftInOrder, leftPostOrder);
    root.right = this.buildTreeFromInPost(rightInOrder, rightPostOrder);
    
    return root;
  }

  clear() {
    this.root = null;
    this.nodeCount = 0;
    this.treeHeight = -1;
    this.insertionOrder = [];
    this.valuesSet.clear();
  }

  calculatePositions(node = this.root, x = 0, y = 0, level = 0, positions = {}) {
    if (node !== null) {
      const horizontalSpacing = 100 / (level + 1);
      
      this.calculatePositions(node.left, x - horizontalSpacing, y + 80, level + 1, positions);
      
      node.x = x;
      node.y = y;
      positions[node.id] = { x, y, value: node.value, id: node.id };
      
      this.calculatePositions(node.right, x + horizontalSpacing, y + 80, level + 1, positions);
    }
    return positions;
  }

  toJSON() {
    const serializeNode = (node) => {
      if (!node) return null;
      return {
        value: node.value,
        left: serializeNode(node.left),
        right: serializeNode(node.right),
        id: node.id
      };
    };
    
    return {
      root: serializeNode(this.root),
      nodeCount: this.nodeCount,
      treeHeight: this.treeHeight,
      insertionOrder: this.insertionOrder
    };
  }

  fromJSON(data) {
    this.clear();
    
    const deserializeNode = (nodeData) => {
      if (!nodeData) return null;
      const node = new TreeNode(nodeData.value);
      node.id = nodeData.id || Date.now() + Math.random();
      node.left = deserializeNode(nodeData.left);
      node.right = deserializeNode(nodeData.right);
      
      this.valuesSet.add(nodeData.value);
      
      return node;
    };
    
    this.root = deserializeNode(data.root);
    this.nodeCount = data.nodeCount || 0;
    this.treeHeight = data.treeHeight || -1;
    this.insertionOrder = data.insertionOrder || [];
    this.updateHeight();
  }
}