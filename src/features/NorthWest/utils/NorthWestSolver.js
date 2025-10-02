function northWestCorner(supply, demand) {
  const supplyCopy = [...supply];
  const demandCopy = [...demand];
  let i = 0;
  let j = 0;
  const bfs = [];
  
  while (bfs.length < supply.length + demand.length - 1) {
    const s = supplyCopy[i];
    const d = demandCopy[j];
    const v = Math.min(s, d);
    
    supplyCopy[i] -= v;
    demandCopy[j] -= v;
    bfs.push([[i, j], v]);
    
    if (supplyCopy[i] === 0 && i < supply.length - 1) {
      i += 1;
    } else if (demandCopy[j] === 0 && j < demand.length - 1) {
      j += 1;
    }
  }
  
  return bfs;
}

function getBalancedTP(supply, demand, costs) {
  const totalSupply = supply.reduce((a, b) => a + b, 0);
  const totalDemand = demand.reduce((a, b) => a + b, 0);
  
  const supplyBalanced = [...supply];
  const demandBalanced = [...demand];
  const costsBalanced = costs.map(row => [...row]);
  
  if (totalSupply < totalDemand) {
    supplyBalanced.push(totalDemand - totalSupply);
    const dummyCosts = Array(costs[0].length).fill(0);
    costsBalanced.push(dummyCosts);
  } else if (totalSupply > totalDemand) {
    demandBalanced.push(totalSupply - totalDemand);
    for (let i = 0; i < costsBalanced.length; i++) {
      costsBalanced[i].push(0);
    }
  }
  
  return [supplyBalanced, demandBalanced, costsBalanced];
}

function getUsAndVs(bfs, costs) {
  const us = Array(costs.length).fill(null);
  const vs = Array(costs[0].length).fill(null);
  us[0] = 0;
  
  const bfsCopy = [...bfs];
  while (bfsCopy.length > 0) {
    for (let index = 0; index < bfsCopy.length; index++) {
      const [[i, j], _] = bfsCopy[index];
      
      if (us[i] === null && vs[j] === null) {
        continue;
      }
      
      const cost = costs[i][j];
      if (us[i] === null) {
        us[i] = cost - vs[j];
      } else {
        vs[j] = cost - us[i];
      }
      
      bfsCopy.splice(index, 1);
      break;
    }
  }
  
  return [us, vs];
}

function getWs(bfs, costs, us, vs, maximize = false) {
  const ws = [];
  
  for (let i = 0; i < costs.length; i++) {
    for (let j = 0; j < costs[i].length; j++) {
      const nonBasic = bfs.every(([[bi, bj], _]) => bi !== i || bj !== j);
      
      if (nonBasic) {
        const cost = costs[i][j];
        let reducedCost;
        
        if (maximize) {
          reducedCost = (us[i] + vs[j]) - cost;
        } else {
          reducedCost = cost - (us[i] + vs[j]);
        }
        
        ws.push([[i, j], reducedCost]);
      }
    }
  }
  
  return ws;
}

function canBeImproved(ws) {
  return ws.some(([_, v]) => v < 0);
}

function getEnteringVariablePosition(ws) {
  const wsCopy = [...ws];
  wsCopy.sort((a, b) => a[1] - b[1]);
  return wsCopy[0][0];
}

function getPossibleNextNodes(loop, notVisited) {
  const lastNode = loop[loop.length - 1];
  const nodesInRow = notVisited.filter(n => n[0] === lastNode[0]);
  const nodesInColumn = notVisited.filter(n => n[1] === lastNode[1]);
  
  if (loop.length < 2) {
    return [...nodesInRow, ...nodesInColumn];
  } else {
    const prevNode = loop[loop.length - 2];
    const rowMove = prevNode[0] === lastNode[0];
    return rowMove ? nodesInColumn : nodesInRow;
  }
}

function getLoop(bvPositions, evPosition) {
  function inner(loop) {
    if (loop.length > 3) {
      const canBeClosed = getPossibleNextNodes(loop, [evPosition]).length === 1;
      if (canBeClosed) {
        return loop;
      }
    }
    
    const notVisited = bvPositions.filter(pos => 
      !loop.some(node => node[0] === pos[0] && node[1] === pos[1])
    );
    
    const possibleNextNodes = getPossibleNextNodes(loop, notVisited);
    for (const nextNode of possibleNextNodes) {
      const newLoop = inner([...loop, nextNode]);
      if (newLoop) {
        return newLoop;
      }
    }
    
    return null;
  }
  
  return inner([evPosition]);
}

function loopPivoting(bfs, loop) {
  const evenCells = [];
  const oddCells = [];
  
  for (let i = 0; i < loop.length; i++) {
    if (i % 2 === 0) {
      evenCells.push(loop[i]);
    } else {
      oddCells.push(loop[i]);
    }
  }
  
  const leavingValues = oddCells.map(pos => {
    const value = bfs.find(([[bi, bj], _]) => bi === pos[0] && bj === pos[1])[1];
    return [pos, value];
  });
  
  leavingValues.sort((a, b) => a[1] - b[1]);
  const [leavingPosition, leavingValue] = leavingValues[0];
  
  const newBfs = [];
  
  for (const [[i, j], v] of bfs) {
    if (i === leavingPosition[0] && j === leavingPosition[1]) {
      continue;
    }
    
    let newValue = v;
    
    if (evenCells.some(pos => pos[0] === i && pos[1] === j)) {
      newValue += leavingValue;
    } else if (oddCells.some(pos => pos[0] === i && pos[1] === j)) {
      newValue -= leavingValue;
    }
    
    newBfs.push([[i, j], newValue]);
  }
  
  newBfs.push([loop[0], leavingValue]);
  
  return newBfs;
}

function transportationSimplexMethod(supply, demand, costs, maximize = false) {
  const [balancedSupply, balancedDemand, balancedCosts] = getBalancedTP(supply, demand, costs);
  
  let bfs = northWestCorner(balancedSupply, balancedDemand);
  
  const iteraciones = [];
  
  function inner(currentBfs, iterNum = 0) {
    const [us, vs] = getUsAndVs(currentBfs, balancedCosts);
    const ws = getWs(currentBfs, balancedCosts, us, vs, maximize);
    
    const solution = Array(costs.length).fill().map(() => Array(costs[0].length).fill(0));
    for (const [[i, j], v] of currentBfs) {
      if (i < costs.length && j < costs[0].length) {
        solution[i][j] = v;
      }
    }
    
    let totalCost = 0;
    for (let i = 0; i < costs.length; i++) {
      for (let j = 0; j < costs[i].length; j++) {
        totalCost += costs[i][j] * solution[i][j];
      }
    }
    
    iteraciones.push({
      iteration: iterNum,
      bfs: JSON.parse(JSON.stringify(currentBfs)),
      us: [...us],
      vs: [...vs],
      ws: JSON.parse(JSON.stringify(ws)),
      solution: solution.map(row => [...row]),
      totalCost: totalCost
    });
    
    if (canBeImproved(ws)) {
      const evPosition = getEnteringVariablePosition(ws);
      const bvPositions = currentBfs.map(([[i, j], _]) => [i, j]);
      const loop = getLoop(bvPositions, evPosition);
      return inner(loopPivoting(currentBfs, loop), iterNum + 1);
    }
    
    return currentBfs;
  }
  
  const basicVariables = inner(bfs);
  
  const solution = Array(costs.length).fill().map(() => Array(costs[0].length).fill(0));
  
  for (const [[i, j], v] of basicVariables) {
    if (i < costs.length && j < costs[0].length) {
      solution[i][j] = v;
    }
  }
  
  let totalCost = 0;
  for (let i = 0; i < costs.length; i++) {
    for (let j = 0; j < costs[i].length; j++) {
      totalCost += costs[i][j] * solution[i][j];
    }
  }
  
  return {
    solution,
    totalCost,
    iteraciones
  };
}

export function solveTransportationProblem(supply, demand, costs, maximize = false) {
  return transportationSimplexMethod(supply, demand, costs, maximize);
}