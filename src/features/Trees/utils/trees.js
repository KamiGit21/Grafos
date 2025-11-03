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
  }

  insert(value) {
    const newNode = new TreeNode(value);
    
    if (!this.root) {
      this.root = newNode;
    } else {
      const inserted = this._insert(this.root, newNode);
      if (!inserted) {
        console.warn(`Duplicado: el valor ${value} ya existe en el árbol.`);
        alert(`Error: El valor ${value} ya está en el árbol. No se permiten duplicados.`);
        return null;
      }
    }
    
    this.nodeCount++;
    this.insertionOrder.push(newNode.id);
    this.updateHeight();
    return newNode;
  }

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
      }
      return this._insert(node.right, newNode);
    }
    return false;
  }

  removeLast() {
    if (!this.root || this.insertionOrder.length === 0) return null;
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
    return this.findNodeById(node.left, id) || this.findNodeById(node.right, id);
  }

  removeNode(node) {
    const parent = this._findParent(this.root, node);
    if (!parent) {
      this.root = null;
    } else if (parent.left === node) {
      parent.left = null;
    } else if (parent.right === node) {
      parent.right = null;
    }
  }

  _findParent(current, target) {
    if (!current || current === target) return null;
    if (current.left === target || current.right === target) return current;
    return this._findParent(current.left, target) || this._findParent(current.right, target);
  }

  updateHeight() {
    this.treeHeight = this.calculateHeight(this.root);
  }

  calculateHeight(node) {
    if (!node) return -1;
    return Math.max(this.calculateHeight(node.left), this.calculateHeight(node.right)) + 1;
  }

  calculatePositions() {
    if (!this.root) {
      return { positions: {}, bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    // Usar recorrido in-order para posiciones X (BST)
    let xCounter = 0;
    const horizontalSpacing = 80;
    const verticalSpacing = 100;

    // Asignar posiciones X usando in-order traversal
    const assignXPositions = (node) => {
      if (!node) return;
      assignXPositions(node.left);
      node.x = xCounter * horizontalSpacing;
      xCounter++;
      assignXPositions(node.right);
    };

    assignXPositions(this.root);

    // Asignar posiciones Y basadas en la profundidad
    const assignYPositions = (node, depth = 0) => {
      if (!node) return;
      node.y = 60 + depth * verticalSpacing;
      assignYPositions(node.left, depth + 1);
      assignYPositions(node.right, depth + 1);
    };

    assignYPositions(this.root);

    // Centrar el árbol horizontalmente
    this.centerTree();

    // Recolectar todas las posiciones
    const positions = {};
    const traverse = (node) => {
      if (!node) return;
      positions[node.id] = { 
        id: node.id, 
        value: node.value, 
        x: node.x, 
        y: node.y 
      };
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);

    // Calcular límites
    const nodes = Object.values(positions);
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const padding = 60;

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

  centerTree() {
    if (!this.root) return;
    
    // Encontrar los límites actuales
    const findBounds = (node) => {
      if (!node) return { minX: Infinity, maxX: -Infinity };
      
      const leftBounds = findBounds(node.left);
      const rightBounds = findBounds(node.right);
      
      return {
        minX: Math.min(node.x, leftBounds.minX, rightBounds.minX),
        maxX: Math.max(node.x, leftBounds.maxX, rightBounds.maxX)
      };
    };
    
    const bounds = findBounds(this.root);
    const centerOffset = (bounds.minX + bounds.maxX) / 2;
    
    // Ajustar todas las posiciones para centrar
    const adjustPositions = (node) => {
      if (!node) return;
      node.x -= centerOffset;
      adjustPositions(node.left);
      adjustPositions(node.right);
    };
    
    adjustPositions(this.root);
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

  // Métodos auxiliares para métricas
  findMinValue(node = this.root) {
    if (!node) return null;
    while (node.left !== null) {
      node = node.left;
    }
    return node.value;
  }

  findMaxValue(node = this.root) {
    if (!node) return null;
    while (node.right !== null) {
      node = node.right;
    }
    return node.value;
  }

  isBalanced(node = this.root) {
    if (!node) return true;
    
    const checkBalance = (n) => {
      if (!n) return 0;
      
      const leftHeight = checkBalance(n.left);
      if (leftHeight === -1) return -1;
      
      const rightHeight = checkBalance(n.right);
      if (rightHeight === -1) return -1;
      
      if (Math.abs(leftHeight - rightHeight) > 1) return -1;
      
      return Math.max(leftHeight, rightHeight) + 1;
    };
    
    return checkBalance(node) !== -1;
  }
}