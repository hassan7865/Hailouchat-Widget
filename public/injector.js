(function () {
  const script = document.currentScript;


  const clientId = script.getAttribute("data-client-id");
  const baseUrl = "http://192.168.2.108:5173"; 

  if (!clientId) {
    console.error('HailouChat: data-client-id attribute is required');
    return;
  }

  // Create the chat widget container
  const chatContainer = document.createElement("div");
  chatContainer.id = "hailou-chat-widget";
  chatContainer.style.position = "fixed";
  chatContainer.style.top = "0";
  chatContainer.style.left = "0";
  chatContainer.style.width = "100%";
  chatContainer.style.height = "100%";
  chatContainer.style.pointerEvents = "none";
  chatContainer.style.zIndex = "99999";
  chatContainer.style.display = "flex";
  chatContainer.style.justifyContent = "flex-end";
  chatContainer.style.alignItems = "flex-end";

  // Create the iframe for the chat widget
  const iframe = document.createElement("iframe");
  iframe.src = `${baseUrl}?client_id=${clientId}`;
  iframe.style.position = "relative";
  iframe.style.margin = "20px";
  iframe.style.width = "320px";
  iframe.style.height = "450px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "10px";
  iframe.style.pointerEvents = "auto";
  iframe.style.zIndex = "99999";
  iframe.style.background = "transparent";
  iframe.style.overflow = "hidden";
  iframe.style.maxWidth = "calc(100vw - 40px)";
  iframe.style.maxHeight = "calc(100vh - 40px)";
  iframe.style.scrollbarWidth = "none"; // Firefox
  iframe.style.msOverflowStyle = "none"; // IE/Edge
  iframe.style.touchAction = "manipulation"; // Fix touch events
  
  // Mobile responsive styles
  const mediaQuery = window.matchMedia("(max-width: 480px)");
  const updateIframeSize = () => {
    if (mediaQuery.matches) {
      // Mobile: smaller size, bottom-right position
      iframe.style.width = "280px";
      iframe.style.height = "400px";
      iframe.style.margin = "10px";
      iframe.style.position = "relative";
    } else {
      // Desktop: fixed size
      iframe.style.width = "320px";
      iframe.style.height = "450px";
      iframe.style.margin = "20px";
      iframe.style.position = "relative";
    }
  };
  
  // Set initial size
  updateIframeSize();
  
  // Listen for resize events
  mediaQuery.addEventListener('change', updateIframeSize);
  window.addEventListener('resize', updateIframeSize);

  // Listen for messages from iframe to handle center positioning on mobile
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CHAT_OPENED' && mediaQuery.matches) {
      // Mobile: center the iframe when chat opens
      iframe.style.position = "fixed";
      iframe.style.width = "90vw";
      iframe.style.height = "80vh";
      iframe.style.margin = "0";
      iframe.style.left = "50%";
      iframe.style.top = "50%";
      iframe.style.transform = "translate(-50%, -50%)";
      iframe.style.right = "auto";
      iframe.style.bottom = "auto";
      iframe.style.borderRadius = "10px";
    } else if (event.data.type === 'CHAT_CLOSED' && mediaQuery.matches) {
      // Mobile: return to bottom-right button position when chat closes
      iframe.style.position = "relative";
      iframe.style.width = "280px";
      iframe.style.height = "400px";
      iframe.style.margin = "10px";
      iframe.style.left = "auto";
      iframe.style.top = "auto";
      iframe.style.transform = "none";
      iframe.style.right = "auto";
      iframe.style.bottom = "auto";
      iframe.style.borderRadius = "10px";
    }
  });

  chatContainer.appendChild(iframe);
  document.body.appendChild(chatContainer);
})();
