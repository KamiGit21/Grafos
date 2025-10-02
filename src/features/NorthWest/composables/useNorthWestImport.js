export function useNorthWestImport(
  importFileInput,
  setSources,
  setDestinations,
  setSupply,
  setDemand,
  setCosts
) {
  const importJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.sources && Array.isArray(data.sources)) {
          setSources(data.sources);
        }
        if (data.destinations && Array.isArray(data.destinations)) {
          setDestinations(data.destinations);
        }
        if (data.supply && Array.isArray(data.supply)) {
          setSupply(data.supply);
        }
        if (data.demand && Array.isArray(data.demand)) {
          setDemand(data.demand);
        }
        if (data.costs && Array.isArray(data.costs)) {
          setCosts(data.costs);
        }

        alert('Datos importados correctamente');
        event.target.value = '';
      } catch (error) {
        console.error('Error al importar:', error);
        alert('Error al importar el archivo JSON. Verifica que el formato sea correcto.');
      }
    };
    reader.readAsText(file);
  };

  return { importJSON };
}