(function () {
  // Simple prevention of multiple loads
  if (document.getElementById("hailou-chat-widget")) {
    return;
  }

  const script = document.currentScript;
  const clientId = script.getAttribute("data-client-id");
  const baseUrl = "https://hailouchat.com"; ; 

  if (!clientId) {
    console.error('HailouChat: data-client-id attribute is required');
    return;
  }

  // Create container
  const chatContainer = document.createElement("div");
  chatContainer.id = "hailou-chat-widget";
  chatContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 99999;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    overflow: hidden;
    margin: 0;
    padding: 0;
  `;

  // Create iframe
  const iframe = document.createElement("iframe");
  const parentUrl = window.location.href;
  const parentReferrer = document.referrer;
  iframe.src = `${baseUrl}?client_id=${clientId}&parent_url=${encodeURIComponent(parentUrl)}&parent_referrer=${encodeURIComponent(parentReferrer)}`;
  iframe.style.cssText = `
    position: relative;
    border: none;
    border-radius: 10px;
    pointer-events: auto;
    z-index: 99999;
    background: transparent;
    overflow: hidden;
    touch-action: manipulation;
    outline: none;
  `;

  // Simple responsive sizing
  function updateSize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      iframe.style.width = "280px";
      iframe.style.height = "400px";
      iframe.style.margin = "15px";
    } else {
      iframe.style.width = "320px";
      iframe.style.height = "450px";
      iframe.style.margin = "20px";
    }
  }

  // State tracking
  let isFullscreen = false;

  // Handle messages from iframe
  function handleMessage(event) {
    if (event.source !== iframe.contentWindow) return;
    if (!event.data || typeof event.data !== 'object') return;

    const isMobile = window.innerWidth <= 768;
    
    if (event.data.type === 'CHAT_OPENED' && isMobile) {
      if (isFullscreen) return; // Already in fullscreen
      
      isFullscreen = true;
      
      // Mobile fullscreen with CSS transform
      iframe.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: min(95vw, 400px) !important;
        height: min(90vh, 600px) !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 12px !important;
        pointer-events: auto !important;
        z-index: 99999 !important;
        outline: none !important;
        background: white !important;
        overflow: hidden !important;
        touch-action: manipulation !important;
      `;
      
    } else if (event.data.type === 'CHAT_CLOSED' && isMobile) {
      if (!isFullscreen) return; // Already closed
      
      isFullscreen = false;
      
      // Reset to button size
      iframe.style.cssText = `
        position: relative !important;
        border: none !important;
        border-radius: 10px !important;
        pointer-events: auto !important;
        z-index: 99999 !important;
        outline: none !important;
        background: transparent !important;
        overflow: hidden !important;
        touch-action: manipulation !important;
        transform: none !important;
        top: auto !important;
        left: auto !important;
      `;
      
      updateSize();
    }
  }

  // Initialize
  updateSize();
  
  // Add to page
  chatContainer.appendChild(iframe);
  document.body.appendChild(chatContainer);
  
  // Event listeners
  window.addEventListener('message', handleMessage);
  
  // Simple resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isFullscreen) {
        updateSize();
      }
    }, 200);
  });

})();