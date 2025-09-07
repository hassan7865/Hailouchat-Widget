import { ChatWidget } from './components/ChatWidget'

function App() {
  // Get client ID from global config (set by injector) or URL parameters or use default
  const globalConfig = (window as any).hailouChatConfig;
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = globalConfig?.clientId || urlParams.get('client_id') || '82c6ae96-b11b-4fd5-b7b3-1d6270f724d2';

  return (
    <>
      <ChatWidget clientId={clientId} />
    </>
  )
}

export default App
