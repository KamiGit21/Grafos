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
    if (!parent) this.root = null;
    else if (parent.left === node) parent.left = null;
    else parent.right = null;
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
}