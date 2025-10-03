import { ChatWidget } from './components/ChatWidget'

function App() {
  // Get client ID from global config (set by injector) or URL parameters or use default
  const globalConfig = (window as any).hailouChatConfig;
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = globalConfig?.clientId || urlParams.get('client_id') || '5e75b427-1a52-482e-9f7b-7147b28c3eb7';
  
  // Detect mobile from URL parameter first, then window width as fallback
  const urlIsMobile = urlParams.get('is_mobile') === 'true';
  const windowIsMobile = window.innerWidth <= 768;
  // Prioritize URL parameter, only use window width if URL parameter is not set
  const isMobile = urlParams.has('is_mobile') ? urlIsMobile : windowIsMobile;

  return (
    <>
      <ChatWidget clientId={clientId} isMobile={isMobile} />
    </>
  )
}

export default App
