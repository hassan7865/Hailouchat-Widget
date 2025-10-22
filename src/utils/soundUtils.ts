/**
 * Sound utilities for visitor widget notifications
 */

let audioElement: HTMLAudioElement | null = null;
let isAudioEnabled = false;

// Initialize audio element on first user interaction
const initializeAudio = (): void => {
  if (isAudioEnabled) return;
  
  try {
    audioElement = new Audio('/dong.mp3');
    audioElement.volume = 0.5;
    audioElement.preload = 'auto';
    
    // Enable audio on first user interaction
    const enableAudioOnInteraction = () => {
      isAudioEnabled = true;
      // Remove event listeners after first interaction
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
      document.removeEventListener('mousedown', enableAudioOnInteraction);
      document.removeEventListener('focus', enableAudioOnInteraction);
    };
    
    // Listen for any user interaction to enable audio
    document.addEventListener('click', enableAudioOnInteraction, { once: true });
    document.addEventListener('keydown', enableAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });
    document.addEventListener('mousedown', enableAudioOnInteraction, { once: true });
    document.addEventListener('focus', enableAudioOnInteraction, { once: true });
    
    // Try to enable audio immediately if we're in a user gesture context
    setTimeout(() => {
      if (!isAudioEnabled && audioElement) {
        audioElement.play().then(() => {
          isAudioEnabled = true;
          audioElement?.pause();
        }).catch(() => {
          // Audio auto-enable failed, waiting for user interaction
        });
      }
    }, 100);
    
  } catch (error) {
    console.warn('Could not initialize audio:', error);
  }
};

// Initialize audio when the module loads
initializeAudio();

export const playAgentMessageSound = (): void => {
  if (!audioElement) {
    return;
  }
  
  // If audio is not enabled, try to enable it now
  if (!isAudioEnabled) {
    audioElement.play().then(() => {
      isAudioEnabled = true;
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
      }
    }).catch(() => {
      // Could not enable audio
    });
    return;
  }
  
  try {
    // Reset audio to beginning and play
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {
      // Could not play audio
    });
  } catch (error) {
    // Could not play audio
  }
};
