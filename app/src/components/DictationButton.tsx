'use client';
import { useState, useRef, useCallback } from 'react';

interface Props {
  onResult: (text: string) => void;
  append?: boolean;
  className?: string;
  label?: string;
}

export default function DictationButton({ onResult, append = true, className = '', label }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  const toggle = useCallback(() => {
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      alert('Tu navegador no soporta dictado por voz. Usa Chrome o Edge.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'es-MX';
    rec.continuous = true;
    rec.interimResults = false;
    recRef.current = rec;

    rec.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        onResult(append ? transcript : transcript.trim());
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }, [listening, onResult, append]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'Detener dictado' : 'Dictar por voz'}
      className={`inline-flex items-center justify-center gap-1 h-8 px-2 rounded text-xs font-medium transition-colors ${
        listening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
          : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
      } ${className}`}
    >
      {listening ? '🔴 Detener' : label || '🎤'}
    </button>
  );
}
