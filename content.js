chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "get_status_media") {
      // Función para descargar blob
      async function downloadBlob(blobUrl) {
        try {
          const response = await fetch(blobUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          return url;
        } catch (error) {
          console.error('Error al procesar blob:', error);
          return null;
        }
      }
  
      // Función principal asíncrona
      async function getMediaUrl() {
        const mediaElement = document.querySelector('img[data-testid="status-image"], video[data-testid="status-video"]');
        
        if (!mediaElement) {
          sendResponse({ success: false, message: 'No se encontró contenido multimedia' });
          return;
        }
  
        let url;
        let type;
        
        if (mediaElement.tagName === 'IMG') {
          url = mediaElement.src;
          type = 'jpg';
        } else if (mediaElement.tagName === 'VIDEO') {
          // Manejar videos en formato blob
          const videoSrc = mediaElement.src;
          if (videoSrc.startsWith('blob:')) {
            url = await downloadBlob(videoSrc);
            if (!url) {
              sendResponse({ success: false, message: 'Error al procesar el video' });
              return;
            }
          } else {
            url = videoSrc;
          }
          type = 'mp4';
        }
  
        if (url) {
          sendResponse({ url, type, success: true });
        } else {
          sendResponse({ success: false, message: 'No se pudo obtener la URL del contenido' });
        }
      }
  
      // Ejecutar la función principal
      getMediaUrl();
      return true; // Mantener el canal de mensaje abierto para la respuesta asíncrona
    }
  });
  