export function useGraphImport(importFileInput, nodes, edges, deselectElement) {
  const triggerImportJSON = () => {
    importFileInput.value.click();
  };

  const importJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        nodes.value = data.nodes || [];
        edges.value = (data.edges || []).map(edge => ({
          ...edge,
          curveOffset: edge.curveOffset || 0,
        }));
        deselectElement();
        alert("Grafo importado exitosamente.");
      } catch (error) {
        console.error("Error al importar el JSON:", error);
        alert("Error al importar el archivo JSON. Asegúrate de que sea un formato válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return {
    triggerImportJSON,
    importJSON
  };
}