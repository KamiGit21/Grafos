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

  // ✅ NUEVO: POSICIONAMIENTO SIN SUPERPOSICIÓN
  calculatePositions() {
    if (!this.root) {
      return { positions: {}, bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    // Paso 1: Obtener nodos en in-order (ordenado por valor)
    const inOrderNodes = [];
    const collectInOrder = (node) => {
      if (!node) return;
      collectInOrder(node.left);
      inOrderNodes.push(node);
      collectInOrder(node.right);
    };
    collectInOrder(this.root);

    // Paso 2: Asignar X basado en in-order (evita superposición horizontal)
    const horizontalSpacing = 100;
    inOrderNodes.forEach((node, index) => {
      node.x = index * horizontalSpacing;
    });

    // Paso 3: Asignar Y por profundidad
    const verticalSpacing = 100;
    const assignY = (node, depth = 0) => {
      if (!node) return;
      node.y = 60 + depth * verticalSpacing; // Raíz en Y=60
      assignY(node.left, depth + 1);
      assignY(node.right, depth + 1);
    };
    assignY(this.root);

    // Paso 4: Construir mapa de posiciones
    const positions = {};
    const traverse = (node) => {
      if (!node) return;
      positions[node.id] = { id: node.id, value: node.value, x: node.x, y: node.y };
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);

    // Paso 5: Calcular límites
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

  clear() {
    this.root = null;
    this.nodeCount = 0;
    this.treeHeight = -1;
    this.insertionOrder = [];
    globalNodeId = 1; // Reiniciar IDs
  }
}