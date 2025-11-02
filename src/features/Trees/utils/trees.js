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

  // INSERT CON MENSAJE DE DUPLICADO
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
    this.calculatePositions(); // RECALCULA
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
    return false; // DUPLICADO
  }

  removeLast() {
    if (!this.root || this.insertionOrder.length === 0) return null;
    const lastNodeId = this.insertionOrder.pop();
    const nodeToRemove = this.findNodeById(this.root, lastNodeId);
    if (!nodeToRemove) return null;
    this.removeNode(nodeToRemove);
    this.nodeCount--;
    this.updateHeight();
    this.calculatePositions();
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

  // POSICIONES: RAÍZ EN Y=60
  calculatePositions() {
    const positions = {};
    if (!this.root) return { positions, bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };

    let minX = Infinity, maxX = -Infinity, minY = 60, maxY = 60;

    const traverse = (node, x, y, level) => {
      if (!node) return;

      if (node.left) traverse(node.left, x - 100, y + 100, level + 1);
      if (node.right) traverse(node.right, x + 100, y + 100, level + 1);

      node.x = x;
      node.y = y;
      positions[node.id] = { id: node.id, value: node.value, x, y };

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };

    traverse(this.root, 0, 60, 0);

    const padding = 120;
    return {
      positions,
      bounds: {
        minX: minX - padding,
        maxX: maxX + padding,
        minY: 30, // FIJO ARRIBA
        maxY: maxY + padding
      }
    };
  }

  clear() {
    this.root = null;
    this.nodeCount = 0;
    this.treeHeight = -1;
    this.insertionOrder = [];
  }
}