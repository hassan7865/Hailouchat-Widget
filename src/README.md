# Chat Widget - Modular Architecture

This chat widget has been refactored into a modular, reusable architecture that can be easily injected into any HTML page.

## Architecture Overview

### Components Structure
```
src/
├── components/
│   ├── ChatWidget.tsx          # Main orchestrating component
│   └── chat/                   # Chat-specific components
│       ├── ChatButton.tsx      # Floating chat button
│       ├── ChatHeader.tsx      # Chat window header
│       ├── ChatWindow.tsx      # Main chat window container
│       ├── MessageList.tsx     # Message display component
│       ├── MessageInput.tsx    # Message input component
│       └── WelcomeScreen.tsx   # Initial welcome screen
├── hooks/
│   ├── useChat.ts             # Chat logic and state management
│   └── useWebSocket.ts        # WebSocket connection management
├── types/
│   └── chat.ts                # TypeScript interfaces and types
├── utils/
│   ├── deviceDetection.ts     # Device and browser detection
│   ├── locationDetection.ts   # IP and location detection
│   └── messageUtils.ts        # Message formatting utilities
├── config/
│   └── chatConfig.ts          # Configuration constants
└── index.ts                   # Main export file
```

## Key Features

### 1. Modular Design
- Each component has a single responsibility
- Easy to test and maintain
- Reusable across different contexts

### 2. Configurable Client ID
- Client ID can be passed via URL parameters: `?client_id=your-client-id`
- Client ID can be passed via data attributes in injector script
- Fallback to default client ID if not provided
- Easy integration into existing websites

### 3. Custom Hooks
- `useChat`: Manages chat state, messages, and API calls
- `useWebSocket`: Handles WebSocket connections and reconnection logic

### 4. Utility Functions
- Device detection (mobile, tablet, desktop)
- Browser and OS detection
- IP address and location detection
- Message formatting and validation

### 5. Type Safety
- Full TypeScript support
- Comprehensive interfaces for all data structures
- Type-safe props and state management

## Usage

### Basic Integration (Injector Script)
```html
<!-- Simple integration with injector script -->
<script 
  src="path/to/injector.js" 
  data-client-id="your-client-id">
</script>
```

### With URL Parameters
```html
<script src="path/to/injector.js"></script>
<!-- Then visit: yoursite.com?client_id=your-client-id -->
```

### Direct React Integration
```tsx
import { ChatWidget } from './components/ChatWidget';

function App() {
  return <ChatWidget clientId="your-client-id" />;
}
```

### Advanced Configuration
```tsx
<ChatWidget
  clientId="your-client-id"
  apiBase="https://your-api.com/api/v1"
  wsBase="wss://your-websocket.com"
  position="center"
  theme="light"
/>
```

## Props Interface

```tsx
interface ChatWidgetProps {
  clientId: string;                    // Required: Your client identifier
  apiBase?: string;                   // Optional: API base URL
  wsBase?: string;                    // Optional: WebSocket base URL
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  theme?: 'light' | 'dark';
}
```

## Building for Production

The widget is built using Vite and can be compiled to a single JavaScript file for easy injection:

```bash
npm run build
```

This creates a production build that can be injected into any HTML page.

## Integration Example

See `public/example.html` for a complete integration example showing how to use the widget with URL parameters.
