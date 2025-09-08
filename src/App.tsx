import { ChatWidget } from './components/ChatWidget'

function App() {
  // Get client ID from global config (set by injector) or URL parameters or use default
  const globalConfig = (window as any).hailouChatConfig;
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = globalConfig?.clientId || urlParams.get('client_id') || '5e75b427-1a52-482e-9f7b-7147b28c3eb7';

  return (
    <>
      <ChatWidget clientId={clientId} />
    </>
  )
}

export default App
