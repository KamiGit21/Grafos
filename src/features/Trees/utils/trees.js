let globalNodeId = 1;

export class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.id = `node_${globalNodeId++}`;
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
    
    if (!this.root) {
      this.root = newNode;
    } else {
<<<<<<< HEAD
      this.insertLevelOrder(newNode);
=======
      const inserted = this._insert(this.root, newNode);
      if (!inserted) {
        console.warn(`Duplicado: el valor ${value} ya existe en el árbol.`);
        alert(`Error: El valor ${value} ya está en el árbol. No se permiten duplicados.`);
        return null;
      }
>>>>>>> origin/main
    }
    
    this.nodeCount++;
    this.insertionOrder.push(newNode.id);
    this.valuesSet.add(value);
    this.updateHeight();
    return newNode;
  }

<<<<<<< HEAD
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
=======
  _insert(node, newNode) {
    if (newNode.value < node.value) {
      if (!node.left) {
        node.left = newNode;
        return true;
      }
      return this._insert(node.left, newNode);
    } else if (newNode.value > node.value) {
      if (!node.right) {
        node.right = newNode;
        return true;
>>>>>>> origin/main
      }
      return this._insert(node.right, newNode);
    }
    return false;
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
    if (!this.root || this.insertionOrder.length === 0) return null;
    const lastNodeId = this.insertionOrder.pop();
<<<<<<< HEAD
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
=======
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
    return this.findNodeById(node.left, id) || this.findNodeById(node.right, id);
  }

  removeNode(node) {
    const parent = this._findParent(this.root, node);
    if (!parent) this.root = null;
    else if (parent.left === node) parent.left = null;
    else parent.right = null;
  }

  _findParent(current, target) {
    if (!current || current === target) return null;
    if (current.left === target || current.right === target) return current;
    return this._findParent(current.left, target) || this._findParent(current.right, target);
>>>>>>> origin/main
  }

  updateHeight() {
    this.treeHeight = this.calculateHeight(this.root);
  }

  calculateHeight(node) {
    if (!node) return -1;
    return Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right)) + 1;
  }

<<<<<<< HEAD
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
=======
  calculatePositions() {
    if (!this.root) {
      return { positions: {}, bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    const inOrderNodes = [];
    const collectInOrder = (node) => {
      if (!node) return;
      collectInOrder(node.left);
      inOrderNodes.push(node);
      collectInOrder(node.right);
    };
    collectInOrder(this.root);

    const horizontalSpacing = 100;
    inOrderNodes.forEach((node, index) => {
      node.x = index * horizontalSpacing;
    });

    const verticalSpacing = 100;
    const assignY = (node, depth = 0) => {
      if (!node) return;
      node.y = 60 + depth * verticalSpacing;
      assignY(node.left, depth + 1);
      assignY(node.right, depth + 1);
    };
    assignY(this.root);

    const positions = {};
    const traverse = (node) => {
      if (!node) return;
      positions[node.id] = { id: node.id, value: node.value, x: node.x, y: node.y };
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);

    const xs = inOrderNodes.map(n => n.x);
    const ys = inOrderNodes.map(n => n.y);
    const padding = 100;

    return {
      positions,
      bounds: {
        minX: Math.min(...xs) - padding,
        maxX: Math.max(...xs) + padding,
        minY: 30,
        maxY: Math.max(...ys) + padding
      }
    };
  }

  // ✅ SERIALIZACIÓN
  toJSON() {
    const serialize = (node) => {
      if (!node) return null;
      return {
        value: node.value,
        left: serialize(node.left),
        right: serialize(node.right)
      };
    };
    return {
      root: serialize(this.root),
      nodeCount: this.nodeCount,
      treeHeight: this.treeHeight,
      insertionOrder: [...this.insertionOrder]
    };
  }

  // ✅ DESERIALIZACIÓN
  fromJSON(data) {
    if (!data || !data.root) {
      this.clear();
      return;
    }

    const deserialize = (obj) => {
      if (!obj) return null;
      const node = new TreeNode(obj.value);
      node.left = deserialize(obj.left);
      node.right = deserialize(obj.right);
      return node;
    };

    this.root = deserialize(data.root);
    this.nodeCount = data.nodeCount || this.calculateNodeCount(this.root);
    this.treeHeight = data.treeHeight ?? this.calculateHeight(this.root);
    this.insertionOrder = data.insertionOrder || this.collectNodeIds(this.root);
  }

  calculateNodeCount(node) {
    if (!node) return 0;
    return 1 + this.calculateNodeCount(node.left) + this.calculateNodeCount(node.right);
  }

  collectNodeIds(node, ids = []) {
    if (!node) return ids;
    ids.push(node.id);
    this.collectNodeIds(node.left, ids);
    this.collectNodeIds(node.right, ids);
    return ids;
  }

  clear() {
    this.root = null;
    this.nodeCount = 0;
    this.treeHeight = -1;
    this.insertionOrder = [];
    globalNodeId = 1;
  }

  // Recorridos (necesarios para animación)
>>>>>>> origin/main
  inOrder(node = this.root, result = []) {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }

  preOrder(node = this.root, result = []) {
    if (node) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
    return result;
  }

  postOrder(node = this.root, result = []) {
    if (node) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
    return result;
  }
<<<<<<< HEAD

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
=======
>>>>>>> origin/main
}