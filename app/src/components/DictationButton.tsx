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
  const [error, setError] = useState('');
  const recRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  const stopListening = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch {}
      recRef.current = null;
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    setError('');
    if (listening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    finalTranscriptRef.current = '';
    const rec = new SpeechRecognition();
    rec.lang = 'es-MX';
    rec.continuous = false;
    rec.interimResults = true;
    recRef.current = rec;

    let timeout: any = null;

    rec.onresult = (event: any) => {
      if (timeout) clearTimeout(timeout);
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        }
      }
      if (transcript && !listening) {
        onResult(append ? transcript : transcript.trim());
      }
      timeout = setTimeout(() => {
        if (recRef.current) {
          try { recRef.current.stop(); } catch {}
          recRef.current = null;
          setListening(false);
        }
      }, 1500);
    };

    rec.onerror = (e: any) => {
      stopListening();
      if (e.error === 'not-allowed') setError('Permiso de micrófono denegado');
      else if (e.error === 'no-speech') setError('No se detectó voz');
      else if (e.error === 'audio-capture') setError('Micrófono no disponible');
      else setError(`Error: ${e.error}`);
    };

    rec.onend = () => {
      if (finalTranscriptRef.current) {
        onResult(finalTranscriptRef.current);
        finalTranscriptRef.current = '';
      }
      setListening(false);
    };

    try {
      rec.start();
      setListening(true);
    } catch (e: any) {
      setError(`Error al iniciar: ${e.message}`);
      setListening(false);
    }
  }, [listening, onResult, append, stopListening]);

  if (!supported) return null;

  return (
    <div className="inline-flex flex-col items-start">
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
      {error && (
        <span className="text-[10px] text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
}
