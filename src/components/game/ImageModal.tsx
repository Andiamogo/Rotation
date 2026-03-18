import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ImageModalProps {
  src: string
  alt: string
  originRect?: DOMRect
  onClose: () => void
}

type Phase = 'idle' | 'entering' | 'open' | 'exiting'

export function ImageModal({ src, alt, originRect, onClose }: ImageModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const phaseRef = useRef<Phase>('idle')
  const [imgStyle, setImgStyle] = useState<React.CSSProperties>({ opacity: 0 })
  const [overlayVisible, setOverlayVisible] = useState(false)

  const close = useCallback(() => {
    if (phaseRef.current === 'exiting') return
    phaseRef.current = 'exiting'

    if (originRect && imgRef.current) {
      const imgRect = imgRef.current.getBoundingClientRect()
      const scale = Math.min(originRect.width / imgRect.width, originRect.height / imgRect.height)
      const dx = originRect.left + originRect.width / 2 - (imgRect.left + imgRect.width / 2)
      const dy = originRect.top + originRect.height / 2 - (imgRect.top + imgRect.height / 2)

      setOverlayVisible(false)
      setImgStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        borderRadius: '50%',
        opacity: 0,
        transition: 'transform 0.28s cubic-bezier(0.4,0,1,1), border-radius 0.28s, opacity 0.2s',
      })
      setTimeout(onClose, 300)
    } else {
      setOverlayVisible(false)
      setImgStyle({ opacity: 0, borderRadius: '12px', transition: 'opacity 0.2s' })
      setTimeout(onClose, 220)
    }
  }, [originRect, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  function triggerEnter() {
    if (phaseRef.current !== 'idle') return
    phaseRef.current = 'entering'
    const img = imgRef.current
    if (!img) return

    if (originRect) {
      const imgRect = img.getBoundingClientRect()
      const scale = Math.min(originRect.width / imgRect.width, originRect.height / imgRect.height)
      const dx = originRect.left + originRect.width / 2 - (imgRect.left + imgRect.width / 2)
      const dy = originRect.top + originRect.height / 2 - (imgRect.top + imgRect.height / 2)

      // Apply start state (no transition, invisible → visible next frame)
      setImgStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
        borderRadius: '50%',
        opacity: 1,
        transition: 'none',
      })

      // Double rAF to force browser to paint the start state before transitioning
      requestAnimationFrame(() => requestAnimationFrame(() => {
        phaseRef.current = 'open'
        setImgStyle({
          transform: 'translate(0,0) scale(1)',
          borderRadius: '12px',
          opacity: 1,
          transition: 'transform 0.42s cubic-bezier(0.32,0.72,0,1), border-radius 0.42s',
        })
        setOverlayVisible(true)
      }))
    } else {
      requestAnimationFrame(() => {
        phaseRef.current = 'open'
        setImgStyle({ opacity: 1, borderRadius: '12px', transition: 'opacity 0.25s' })
        setOverlayVisible(true)
      })
    }
  }

  // Handle both onLoad (network) and already-cached images
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete) triggerEnter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createPortal(
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
        backdropFilter: overlayVisible ? 'blur(6px)' : 'none',
        opacity: overlayVisible ? 1 : 0,
        transition: 'opacity 0.3s, backdrop-filter 0.3s',
        // Allow click-through while opacity is 0 so the initial frames don't block interaction
        pointerEvents: phaseRef.current === 'idle' ? 'none' : 'auto',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={triggerEnter}
          style={{
            maxHeight: '80vh', maxWidth: '90vw',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
            display: 'block',
            willChange: 'transform',
            ...imgStyle,
          }}
        />
        <button
          type="button"
          onClick={close}
          style={{
            position: 'absolute', top: -14, right: -14,
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
            color: 'var(--text)', fontSize: '1rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          ✕
        </button>
        <p style={{
          textAlign: 'center', marginTop: 10,
          color: 'var(--text-soft)', fontSize: '0.8rem',
          opacity: overlayVisible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}>
          {alt}
        </p>
      </div>
    </div>,
    document.body
  )
}
