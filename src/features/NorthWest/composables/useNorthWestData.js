import { ref } from 'vue';

export function useNorthWestData() {
  const sources = ref(['Origen 1', 'Origen 2', 'Origen 3']);
  const destinations = ref(['Destino 1', 'Destino 2', 'Destino 3']);
  const supply = ref([20, 30, 25]);
  const demand = ref([15, 25, 35]);
  const costs = ref([
    [4, 8, 8],
    [16, 24, 16],
    [8, 16, 24]
  ]);

  const addSource = () => {
    sources.value.push(`Origen ${sources.value.length + 1}`);
    supply.value.push(0);
    costs.value.push(Array(destinations.value.length).fill(0));
  };

  const addDestination = () => {
    destinations.value.push(`Destino ${destinations.value.length + 1}`);
    demand.value.push(0);
    costs.value.forEach(row => row.push(0));
  };

  const removeSource = (index) => {
    if (sources.value.length > 1) {
      sources.value.splice(index, 1);
      supply.value.splice(index, 1);
      costs.value.splice(index, 1);
    }
  };

  const removeDestination = (index) => {
    if (destinations.value.length > 1) {
      destinations.value.splice(index, 1);
      demand.value.splice(index, 1);
      costs.value.forEach(row => row.splice(index, 1));
    }
  };

  const updateSourceName = (index, name) => {
    sources.value[index] = name;
  };

  const updateDestinationName = (index, name) => {
    destinations.value[index] = name;
  };

  const updateSupply = (index, value) => {
    supply.value[index] = parseFloat(value) || 0;
  };

  const updateDemand = (index, value) => {
    demand.value[index] = parseFloat(value) || 0;
  };

  const updateCost = (i, j, value) => {
    costs.value[i][j] = parseFloat(value) || 0;
  };

  const setSources = (newSources) => {
    sources.value = newSources;
  };

  const setDestinations = (newDestinations) => {
    destinations.value = newDestinations;
  };

  const setSupply = (newSupply) => {
    supply.value = newSupply;
  };

  const setDemand = (newDemand) => {
    demand.value = newDemand;
  };

  const setCosts = (newCosts) => {
    costs.value = newCosts;
  };

  return {
    sources,
    destinations,
    supply,
    demand,
    costs,
    addSource,
    addDestination,
    removeSource,
    removeDestination,
    updateSourceName,
    updateDestinationName,
    updateSupply,
    updateDemand,
    updateCost,
    setSources,
    setDestinations,
    setSupply,
    setDemand,
    setCosts
  };
}