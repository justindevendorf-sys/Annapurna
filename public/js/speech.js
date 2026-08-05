// Text-to-speech and voice-to-text helpers, used throughout the app so any
// screen can be read aloud and any text field can be filled by voice.

let currentUtterance = null;

export function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = 0.95;
  currentUtterance.pitch = 1.0;
  window.speechSynthesis.speak(currentUtterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function isSpeechSupported() {
  return 'speechSynthesis' in window;
}

export function isListeningSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * Starts one-shot voice-to-text. Calls onResult(transcript) when speech is
 * recognized, onEnd() when listening stops (success or not), onError(msg) on
 * failure. Returns the recognition instance so callers can stop it early.
 */
export function startListening({ onResult, onEnd, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError?.('Voice typing is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult?.(transcript);
  };
  recognition.onerror = (event) => {
    onError?.(event.error || 'Could not hear you, please try again.');
  };
  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return recognition;
}
