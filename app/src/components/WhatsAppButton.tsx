'use client';

import { useState } from 'react';

const WHATSAPP_URL = `https://wa.me/14199346363?text=${encodeURIComponent('Hola, me gustaría información sobre los servicios de psicología.')}`;

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '320px',
            height: '400px',
            borderRadius: '12px',
            background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#075e54',
              color: '#fff',
              padding: '14px 16px',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Centro VivirLibre</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center',
              color: '#333',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#075e54',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '28px',
                color: '#fff',
              }}
            >
              💬
            </div>
            <p style={{ margin: '0 0 12px 0' }}>
              ¿Tiene alguna pregunta sobre nuestros servicios de psicología?
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#666' }}>
              Envíenos un mensaje y le responderemos lo antes posible.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#25d366',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label="WhatsApp"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25d366',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          color: '#fff',
          transition: 'transform 0.2s',
        }}
      >
        💬
      </button>
    </>
  );
}
