export function useNorthWestExport(sources, destinations, supply, demand, costs) {
  const exportJSON = () => {
    const data = {
      sources: sources.value,
      destinations: destinations.value,
      supply: supply.value,
      demand: demand.value,
      costs: costs.value,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `northwest-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { exportJSON };
}