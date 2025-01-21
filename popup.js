document.addEventListener("DOMContentLoaded", function () {
    const downloadBtn = document.getElementById("download-btn");
    const statusMessage = document.getElementById("status-message");
  
    function updateUI(message, isError = false) {
      statusMessage.textContent = message;
      statusMessage.classList.toggle('error', isError);
    }
  
    function checkWhatsAppStatus() {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0].url;
        if (!currentUrl.includes('web.whatsapp.com')) {
          downloadBtn.disabled = true;
          updateUI('Abre WhatsApp Web primero', true);
          return;
        }
      });
    }
  
    downloadBtn.addEventListener("click", function () {
      downloadBtn.classList.add('loading');
      downloadBtn.disabled = true;
      updateUI('Descargando estado...');
  
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.runtime.sendMessage(
          { message: "download_status", tabId: tabs[0].id },
          (response) => {
            downloadBtn.classList.remove('loading');
            
            if (response && response.success) {
              updateUI(response.message);
            } else {
              updateUI(response?.message || 'Error en la descarga', true);
            }
  
            setTimeout(() => {
              downloadBtn.disabled = false;
            }, 1500);
          }
        );
      });
    });
  
    checkWhatsAppStatus();
  });
  
  