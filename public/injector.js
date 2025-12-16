(function () {
  if (document.getElementById("hailou-chat-widget")) {
    return;
  }

  const script = document.currentScript;
  const clientId = script.getAttribute("data-client-id");
  const baseUrl = "https://widget.hailouchat.com";

  if (!clientId) {
    console.error("HailouChat: data-client-id attribute is required");
    return;
  }

  // State
  let isFullscreen = false;
  let isKeyboardOpen = false;
  let initialViewportHeight = window.innerHeight;
  let resizeTimer;

  const isMobile = () => {
    const ua = navigator.userAgent;
    const mobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const narrowScreen =
      (window.innerWidth || document.documentElement.clientWidth) <= 768;
    try {
      const parentNarrow = parent.innerWidth <= 768;
      return mobileUA || narrowScreen || parentNarrow;
    } catch {
      return mobileUA || narrowScreen;
    }
  };

  // Extract tracking parameters from URL
  const getTrackingParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchtype = urlParams.get('matchtype') || urlParams.get('match_type') || null;
    const keyword = urlParams.get('keyword') || null;
    return { matchtype, keyword };
  };

  // Detect platform from referrer or URL
  const detectPlatform = () => {
    const referrer = document.referrer.toLowerCase();
    const currentUrl = window.location.href.toLowerCase();
    
    // Check referrer first
    if (referrer.includes('facebook.com') || referrer.includes('fb.com') || currentUrl.includes('facebook.com')) {
      return 'facebook';
    }
    if (referrer.includes('instagram.com') || currentUrl.includes('instagram.com')) {
      return 'instagram';
    }
    if (referrer.includes('google.com') || referrer.includes('googleadservices.com') || currentUrl.includes('gclid=')) {
      return 'google_ads';
    }
    if (referrer.includes('twitter.com') || referrer.includes('x.com') || currentUrl.includes('twitter.com') || currentUrl.includes('x.com')) {
      return 'twitter';
    }
    if (referrer.includes('linkedin.com') || currentUrl.includes('linkedin.com')) {
      return 'linkedin';
    }
    if (referrer.includes('tiktok.com') || currentUrl.includes('tiktok.com')) {
      return 'tiktok';
    }
    if (referrer.includes('snapchat.com') || currentUrl.includes('snapchat.com')) {
      return 'snapchat';
    }
    if (referrer.includes('pinterest.com') || currentUrl.includes('pinterest.com')) {
      return 'pinterest';
    }
    if (referrer.includes('youtube.com') || referrer.includes('youtu.be') || currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
      return 'youtube';
    }
    
    // Check for UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    if (utmSource) {
      return utmSource.toLowerCase();
    }
    
    return null;
  };

  // Create elements
  const chatContainer = document.createElement("div");
  chatContainer.id = "hailou-chat-widget";

  const iframe = document.createElement("iframe");
  const parentUrl = window.location.href;
  const parentReferrer = document.referrer;
  const pageTitle = document.title;
  const { matchtype, keyword } = getTrackingParams();
  const platform = detectPlatform();
  
  // Build iframe URL with all parameters
  const iframeParams = new URLSearchParams();
  iframeParams.set('client_id', clientId);
  iframeParams.set('parent_url', parentUrl);
  iframeParams.set('parent_referrer', parentReferrer);
  iframeParams.set('page_title', pageTitle);
  iframeParams.set('is_mobile', isMobile());
  
  if (matchtype) {
    iframeParams.set('matchtype', matchtype);
  }
  if (keyword) {
    iframeParams.set('keyword', keyword);
  }
  if (platform) {
    iframeParams.set('platform', platform);
  }
  
  iframe.src = `${baseUrl}?${iframeParams.toString()}`;

  // Set body scroll state
  function setBodyScroll(locked) {
    if (locked) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.style.overflow = "";
    }
  }

  // Set fullscreen mode
  function setFullscreen() {
    setBodyScroll(true);

    chatContainer.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      pointer-events: none !important;
      z-index: 999999 !important;
      margin: 0 !important;
      padding: 0 !important;
    `;

    iframe.style.cssText = `
      position: absolute !important;
      top: env(safe-area-inset-top, 0) !important;
      left: env(safe-area-inset-left, 0) !important;
      right: env(safe-area-inset-right, 0) !important;
      bottom: env(safe-area-inset-bottom, 0) !important;
      width: calc(100% - env(safe-area-inset-left, 0) - env(safe-area-inset-right, 0)) !important;
      height: calc(100% - env(safe-area-inset-top, 0) - env(safe-area-inset-bottom, 0)) !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      pointer-events: auto !important;
      z-index: 1 !important;
      outline: none !important;
      background: white !important;
      overflow: hidden !important;
      touch-action: manipulation !important;
      transform: none !important;
      box-sizing: border-box !important;
      -webkit-overflow-scrolling: touch !important;
    `;
  }

  // Set widget (button) mode
  function setWidgetSize() {
    setBodyScroll(false);

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

    const mobile = isMobile();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Responsive dimensions based on screen size
    let width, height;
    if (mobile) {
      // Mobile: use percentage of screen width/height
      width = Math.min(screenWidth * 0.9, 400) + "px";
      height = Math.min(screenHeight * 0.6, 500) + "px";
    } else {
      // Desktop: responsive based on screen size
      if (screenWidth < 1200) {
        width = "300px";
        height = "450px";
      } else if (screenWidth < 1600) {
        width = "320px";
        height = "500px";
      } else {
        width = "350px";
        height = "550px";
      }
    }

    iframe.style.cssText = `
      position: relative;
      width: ${width};
      height: ${height};
      margin: ${
        mobile
          ? "calc(15px + env(safe-area-inset-bottom, 0)) calc(15px + env(safe-area-inset-right, 0)) 15px 15px"
          : "20px"
      };
      border: none;
      border-radius: 10px;
      pointer-events: auto;
      z-index: 99999;
      background: transparent;
      overflow: hidden;
      touch-action: manipulation;
      outline: none;
      transform: none;
    `;
  }

  // Handle keyboard state change
  function notifyKeyboardState(open, height) {
    iframe.contentWindow.postMessage(
      {
        type: "KEYBOARD_STATE_CHANGE",
        isKeyboardOpen: open,
        viewportHeight: height,
      },
      "*"
    );
  }

  // Handle messages from iframe
  function handleMessage(event) {
    if (event.source !== iframe.contentWindow) return;
    if (!event.data || typeof event.data !== "object") return;

    if (!isMobile()) return;

    if (event.data.type === "CHAT_OPENED") {
      if (!isFullscreen) {
        isFullscreen = true;
        setFullscreen();
      }
    } else if (event.data.type === "CHAT_CLOSED") {
      if (isFullscreen) {
        isFullscreen = false;
        setWidgetSize();
      }
    }
  }

  // Handle viewport changes
  function handleViewportChange() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;
      const newKeyboardState = heightDiff > 150;

      if (newKeyboardState !== isKeyboardOpen) {
        isKeyboardOpen = newKeyboardState;
        notifyKeyboardState(isKeyboardOpen, currentHeight);
      }

      if (isFullscreen && isMobile()) {
        setFullscreen();
      } else if (!isFullscreen) {
        setWidgetSize();
      }
    }, 300);
  }

  // Initialize
  if (isMobile()) {
    isFullscreen = true;
    setFullscreen();
  } else {
    setWidgetSize();
  }

  chatContainer.appendChild(iframe);
  document.body.appendChild(chatContainer);

  // Event listeners
  window.addEventListener("message", handleMessage);
  window.addEventListener("resize", handleViewportChange);

  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      initialViewportHeight = window.innerHeight;
      isKeyboardOpen = false;
      handleViewportChange();
    }, 500);
  });

  // Visual viewport for better keyboard detection
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      const currentHeight = window.visualViewport.height;
      const heightDiff = initialViewportHeight - currentHeight;
      const newKeyboardState = heightDiff > 150;

      if (newKeyboardState !== isKeyboardOpen) {
        isKeyboardOpen = newKeyboardState;
        notifyKeyboardState(isKeyboardOpen, currentHeight);
      }
    });
  }
})();
