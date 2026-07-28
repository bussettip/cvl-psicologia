'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setUsuario } from '@/lib/auth';

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fingerprintLoading, setFingerprintLoading] = useState(false);
  const [fingerprintError, setFingerprintError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsuario(data.user);
      document.cookie = `crm_session=${btoa(JSON.stringify(data.user))}; path=/; max-age=86400`;
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintLogin = async () => {
    setFingerprintLoading(true);
    setFingerprintError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        setFingerprintError('No se pudo verificar la huella');
        setFingerprintLoading(false);
        return;
      }

      const credentialId = bufferToBase64(assertion.rawId);

      const res = await fetch('/api/auth/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      try { setUsuario(data.user); } catch {}
      document.cookie = `crm_session=${btoa(JSON.stringify(data.user))}; path=/; max-age=86400`;
      window.location.href = '/';
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setFingerprintError('Huella no reconocida o cancelada');
      } else {
        setFingerprintError('Error: ' + e.message);
      }
    } finally {
      setFingerprintLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">CRM Psicología</h1>
            <p className="text-gray-500 mt-1">Inicia sesión para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800"
                placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-800"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition-colors">
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">o</span>
            </div>
          </div>

          <button onClick={handleFingerprintLogin} disabled={fingerprintLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-medium text-sm transition-colors">
            {fingerprintLoading ? (
              <>⏳ Coloca tu dedo en el lector...</>
            ) : (
              <>👆 Iniciar Sesión con Huella</>
            )}
          </button>
          {fingerprintError && <p className="text-red-600 text-xs mt-2 text-center">{fingerprintError}</p>}
        </div>
      </div>
    </div>
  );
}
