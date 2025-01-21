function downloadCurrentStatus() {
    async function getCurrentStatus() {
      // Intentar múltiples selectores para encontrar el estado
      const selectors = [
        // Selectores para el contenedor del estado
        '[data-testid="status-v3-player"]',
        '[data-testid="story-view"]',
        '.status-v3-player',
        // Si ninguno de los anteriores funciona, buscar directamente el contenido multimedia
        'div[role="application"] img[src^="blob:"]',
        'div[role="application"] video[src^="blob:"]'
      ];
  
      let mediaElement = null;
      
      // Intentar cada selector hasta encontrar uno que funcione
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          // Si es un contenedor, buscar el medio dentro de él
          if (element.tagName !== 'IMG' && element.tagName !== 'VIDEO') {
            mediaElement = element.querySelector('img[src^="blob:"], video[src^="blob:"]');
          } else {
            mediaElement = element;
          }
          if (mediaElement) break;
        }
      }
  
      // Si no se encuentra el elemento multimedia
      if (!mediaElement) {
        console.log("Depuración: No se encontró el elemento multimedia");
        // Listar todos los elementos blob en la página para depuración
        const allBlobElements = document.querySelectorAll('img[src^="blob:"], video[src^="blob:"]');
        console.log("Total de elementos blob encontrados:", allBlobElements.length);
        allBlobElements.forEach((el, i) => console.log(`Elemento ${i}:`, el.tagName, el.src));
        
        return { 
          success: false, 
          message: "No se encontró ningún estado para descargar. Asegúrate de estar viendo un estado." 
        };
      }
  
      try {
        const response = await fetch(mediaElement.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Determinar el tipo de archivo
        const isVideo = mediaElement.tagName === 'VIDEO';
        const date = new Date();
        const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}`;
        
        a.download = `whatsapp_status_${timestamp}.${isVideo ? 'mp4' : 'jpg'}`;
        a.click();
        window.URL.revokeObjectURL(url);
  
        return {
          success: true,
          message: "¡Estado descargado correctamente!"
        };
      } catch (error) {
        console.error('Error en la descarga:', error);
        return {
          success: false,
          message: "Error al descargar el estado. Inténtalo de nuevo."
        };
      }
    }
  
    return getCurrentStatus();
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download_status") {
      chrome.scripting.executeScript({
        target: { tabId: request.tabId },
        func: downloadCurrentStatus
      }, (results) => {
        sendResponse({
          success: results && results[0]?.result?.success,
          message: results && results[0]?.result?.message
        });
      });
      return true;
    }
  });
  