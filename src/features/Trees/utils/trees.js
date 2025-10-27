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
  }

  insert(value) {
    const newNode = new TreeNode(value);
    
    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
    
    this.nodeCount++;
    this.insertionOrder.push(newNode.id);
    this.updateHeight();
    return newNode;
  }

  insertNode(node, newNode) {
    if (newNode.value < node.value) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  removeLast() {
    if (this.root === null || this.insertionOrder.length === 0) return null;
    
    const lastNodeId = this.insertionOrder.pop();
    const nodeToRemove = this.findNodeById(this.root, lastNodeId);
    
    if (!nodeToRemove) return null;
    
    this.removeNode(nodeToRemove);
    this.nodeCount--;
    this.updateHeight();
    return nodeToRemove;
  }

  findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    
    const leftResult = this.findNodeById(node.left, id);
    if (leftResult) return leftResult;
    
    return this.findNodeById(node.right, id);
  }

  removeNode(node) {
    if (!node) return;
    
    const findParent = (current, target) => {
      if (!current) return null;
      if (current.left === target || current.right === target) return current;
      
      const leftParent = findParent(current.left, target);
      if (leftParent) return leftParent;
      
      return findParent(current.right, target);
    };
    
    const parent = findParent(this.root, node);
    
    if (!parent) {
      this.root = null;
    } else if (parent.left === node) {
      parent.left = null;
    } else {
      parent.right = null;
    }
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

  buildTreeFromInPre(inOrder, preOrder) {
    if (inOrder.length === 0 || preOrder.length === 0) return null;
    
    const rootValue = preOrder[0];
    const root = new TreeNode(rootValue);
    
    const rootIndex = inOrder.indexOf(rootValue);
    
    if (rootIndex === -1) {
      throw new Error('Los recorridos In-Orden y Pre-Orden no son compatibles');
    }
    
    const leftInOrder = inOrder.slice(0, rootIndex);
    const rightInOrder = inOrder.slice(rootIndex + 1);
    const leftPreOrder = preOrder.slice(1, 1 + leftInOrder.length);
    const rightPreOrder = preOrder.slice(1 + leftInOrder.length);
    
    root.left = this.buildTreeFromInPre(leftInOrder, leftPreOrder);
    root.right = this.buildTreeFromInPre(rightInOrder, rightPreOrder);
    
    return root;
  }

  buildTreeFromInPost(inOrder, postOrder) {
    if (inOrder.length === 0 || postOrder.length === 0) return null;
    
    const rootValue = postOrder[postOrder.length - 1];
    const root = new TreeNode(rootValue);
    
    const rootIndex = inOrder.indexOf(rootValue);
    
    if (rootIndex === -1) {
      throw new Error('Los recorridos In-Orden y Post-Orden no son compatibles');
    }
    
    const leftInOrder = inOrder.slice(0, rootIndex);
    const rightInOrder = inOrder.slice(rootIndex + 1);
    const leftPostOrder = postOrder.slice(0, leftInOrder.length);
    const rightPostOrder = postOrder.slice(leftInOrder.length, postOrder.length - 1);
    
    root.left = this.buildTreeFromInPost(leftInOrder, leftPostOrder);
    root.right = this.buildTreeFromInPost(rightInOrder, rightPostOrder);
    
    return root;
  }

  clear() {
    this.root = null;
    this.nodeCount = 0;
    this.treeHeight = -1;
    this.insertionOrder = [];
  }

  calculatePositions(node = this.root, x = 0, y = 0, level = 0, positions = {}) {
    if (node !== null) {
      const horizontalSpacing = Math.max(50, 300 / (level + 1));
      
      this.calculatePositions(node.left, x - horizontalSpacing, y + 100, level + 1, positions);
      
      node.x = x;
      node.y = y;
      positions[node.id] = { x, y, value: node.value, id: node.id };
      
      this.calculatePositions(node.right, x + horizontalSpacing, y + 100, level + 1, positions);
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
      return node;
    };
    
    this.root = deserializeNode(data.root);
    this.nodeCount = data.nodeCount || 0;
    this.treeHeight = data.treeHeight || -1;
    this.insertionOrder = data.insertionOrder || [];
  }
}