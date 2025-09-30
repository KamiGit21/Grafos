import jsPDF from 'jspdf';

export function useGraphExport(
  nodes,
  edges,
  graphSvg,
  deselectElement,
  currentTheme,
  canvasBackgroundStyle,
  canvasBackgroundColor,
  zoomLevel,
  panX,
  panY
) {
  const getCanvasFromSvg = () => {
    return new Promise((resolve, reject) => {
      const svgElement = graphSvg.value;
      if (!svgElement) {
        reject(new Error("Elemento SVG no encontrado."));
        return;
      }

      const clonedSvg = svgElement.cloneNode(true);
      const svgRect = svgElement.getBoundingClientRect();
      
      clonedSvg.setAttribute('width', svgRect.width);
      clonedSvg.setAttribute('height', svgRect.height);

      if (!clonedSvg.getAttribute('xmlns')) {
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      const vbX = -panX.value;
      const vbY = -panY.value;
      const vbW = svgRect.width / zoomLevel.value;
      const vbH = svgRect.height / zoomLevel.value;
      clonedSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);

      const g = clonedSvg.querySelector('g');
      if (g) {
        g.removeAttribute('transform');
      }

      const defaultGridColor = currentTheme === 'light-theme' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';
      const gridColor = canvasBackgroundStyle.value !== 'blank' ? defaultGridColor : canvasBackgroundColor.value;
      let backgroundStyle = '';

      switch (canvasBackgroundStyle.value) {
        case 'grid':
          backgroundStyle = `
            <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${canvasBackgroundColor.value}" />
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${gridColor}" stroke-width="1"/>
              </pattern>
            </defs>
            <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="url(#grid)" />
          `;
          break;
        case 'dots':
          backgroundStyle = `
            <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${canvasBackgroundColor.value}" />
            <defs>
              <pattern id="dots" width="15" height="15" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="${gridColor}"/>
              </pattern>
            </defs>
            <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="url(#dots)" />
          `;
          break;
        case 'blank':
          backgroundStyle = `
            <rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${canvasBackgroundColor.value}" />
          `;
          break;
      }

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(new XMLSerializer().serializeToString(clonedSvg), 'image/svg+xml');
      const defs = svgDoc.querySelector('defs') || svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const backgroundElement = parser.parseFromString(backgroundStyle, 'image/svg+xml').documentElement;
      
      while (backgroundElement.childNodes.length > 0) {
        const node = backgroundElement.childNodes[0];
        if (node.tagName === 'defs') {
          while (node.childNodes.length > 0) {
            defs.appendChild(node.childNodes[0]);
          }
        } else {
          clonedSvg.insertBefore(node, clonedSvg.firstChild);
        }
      }
      
      if (!svgDoc.querySelector('defs')) {
        clonedSvg.insertBefore(defs, clonedSvg.firstChild);
      }

      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.width = svgRect.width;
      img.height = svgRect.height;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgRect.width * 2;
        canvas.height = svgRect.height * 2;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        console.error("Error al cargar el SVG como imagen.", err);
        reject(new Error("No se pudo cargar el SVG como imagen."));
      };

      img.src = url;
    });
  };

  const exportImage = async () => {
    const fileName = prompt("Ingresa el nombre para la imagen:", "grafo_exportado");
    if (!fileName || fileName.trim() === "") return;

    deselectElement();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await getCanvasFromSvg();
      const link = document.createElement('a');
      link.download = `${fileName.trim()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Error al exportar imagen:", error);
      alert("Ocurrió un error al generar la imagen. Asegúrate de que el lienzo contenga elementos visibles.");
    }
  };

  const exportPDF = async () => {
    const fileName = prompt("Ingresa el nombre para el PDF:", "grafo_exportado");
    if (!fileName || fileName.trim() === "") return;

    deselectElement();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await getCanvasFromSvg();
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${fileName.trim()}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Ocurrió un error al generar el PDF. Asegúrate de que el lienzo contenga elementos visibles.");
    }
  };

  const exportJSON = () => {
    const fileName = prompt("Ingresa el nombre del archivo para guardar:", "grafo");
    if (!fileName) return;

    const data = {
      nodes: nodes.value,
      edges: edges.value,
      currentTheme: currentTheme,
      canvasBackgroundStyle: canvasBackgroundStyle.value,
      canvasBackgroundColor: canvasBackgroundColor.value,
      zoomLevel: zoomLevel.value,
      panX: panX.value,
      panY: panY.value
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.trim()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    exportImage,
    exportPDF,
    exportJSON
  };
}