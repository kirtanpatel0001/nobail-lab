import React from 'react';

interface GlobalImageProps {
  src: string | null;
  alt: string;
  mode?: 'cover' | 'contain';
  aspectRatio?: string;
  className?: string;
}

export default function GlobalImage({ 
  src, 
  alt, 
  mode = 'contain', 
  aspectRatio = '16/11', 
  className = '' 
}: GlobalImageProps) {
  return (
    <>
      <style>{`
        .gl-img-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--line-lt, #EBF3F7);
        }
        .gl-img {
          width: 100%;
          height: 100%;
          display: block;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gl-img-placeholder {
          color: var(--line, #DDE6EA);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: var(--bg, #F4F8FA);
        }
        /* Photo Mode */
        .gl-img-wrap.mode-cover .gl-img {
          object-fit: cover;
        }
        /* Product Mode */
        .gl-img-wrap.mode-contain {
          padding: 1.5rem;
        }
        .gl-img-wrap.mode-contain .gl-img {
          object-fit: contain;
          mix-blend-mode: multiply;
        }
      `}</style>
      <div 
        className={`gl-img-wrap mode-${mode} ${className}`} 
        style={{ aspectRatio }}
      >
        {src ? (
          <img src={src} alt={alt || 'Image'} className="gl-img" loading="lazy" />
        ) : (
          <div className="gl-img-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}
      </div>
    </>
  );
}