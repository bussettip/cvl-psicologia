'use client';
import { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setStreaming(true);
        };
      }
    } catch (e: any) {
      setError('No se pudo acceder a la cámara: ' + e.message);
    }
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    onCapture(dataUrl);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setCameraReady(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">📷 Tomar Foto</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-3">{error}</div>}
          <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden bg-gray-200 border-4 border-indigo-200">
            <video ref={videoRef} autoPlay playsInline muted
              className={`w-full h-full object-cover ${streaming ? '' : 'hidden'}`} />
            {!streaming && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Cámara apagada</span>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2 mt-4">
            {!streaming ? (
              <button onClick={startCamera}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm">
                📷 Encender Cámara
              </button>
            ) : (
              <button onClick={capturePhoto} disabled={!cameraReady}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm">
                ✅ Capturar Foto
              </button>
            )}
            <button onClick={handleClose}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
