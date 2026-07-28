'use client';
import { useState } from 'react';

interface FingerprintCaptureProps {
  userId: number;
  userName: string;
  onRegistered: (credentialId: string) => void;
  onClose: () => void;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export default function FingerprintCapture({ userId, userName, onRegistered, onClose }: FingerprintCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const registerFingerprint = async () => {
    setLoading(true);
    setError('');
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userIdBytes = new TextEncoder().encode(String(userId));

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: 'CRM Psicología', id: window.location.hostname },
        user: {
          id: userIdBytes,
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        setError('No se pudo registrar la huella');
        setLoading(false);
        return;
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        credentialId: bufferToBase64(credential.rawId),
        publicKey: bufferToBase64(response.getAuthenticatorData()),
        userId: userId,
        userName: userName
      };

      const res = await fetch('/api/admin/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentialData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setSuccess(true);
      setTimeout(() => {
        onRegistered(credentialData.credentialId);
        onClose();
      }, 1500);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setError('El usuario canceló o el dispositivo no soporta biometría');
      } else if (e.name === 'SecurityError') {
        setError('Error de seguridad — asegúrese de estar en HTTPS o localhost');
      } else {
        setError('Error: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">🔐 Registro de Huella Dactilar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}
          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-lg font-bold text-green-700">Huella registrada exitosamente</p>
              <p className="text-sm text-gray-500 mt-1">{userName}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-5xl">👆</span>
                </div>
                <p className="text-sm text-gray-600">
                  Coloca tu dedo en el lector biométrico de tu dispositivo para registrarlo como método de acceso.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Se usará para iniciar sesión de forma rápida y segura.
                </p>
              </div>
              <button onClick={registerFingerprint} disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium text-sm transition-colors">
                {loading ? '⏳ Coloca tu dedo en el lector...' : '👆 Registrar Huella'}
              </button>
            </>
          )}
          <button onClick={onClose}
            className="w-full mt-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
