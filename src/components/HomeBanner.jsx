import { useState, useEffect, useRef } from 'react';
import { getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import '../styles/HomeBanner.css';

/**
 * HomeBanner — Banner angosto entre el Carousel y las secciones de Home.
 *
 * Estructura del documento Firestore  →  banners / home_banner
 * {
 *   active   : boolean          // true = visible, false = oculto
 *   interval : number           // ms entre slides (default 5000)
 *   images   : Array<string | { url: string, link?: string }>
 * }
 *
 * Las imágenes pueden ser strings simples (solo URL) u objetos { url, link }.
 * Si incluyen `link`, el banner es clickeable.
 */
export function HomeBanner() {
  const [bannerData, setBannerData]   = useState(null);
  const [shown, setShown]             = useState(0);
  const [animPhase, setAnimPhase]     = useState('idle'); // 'idle' | 'out' | 'in'

  // Refs para evitar stale closures en callbacks
  const shownRef   = useRef(0);
  const nextRef    = useRef(0);
  const phaseRef   = useRef('idle');

  /* ─── Carga desde Firestore ───────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const db   = getFirestore(getApp());
        const snap = await getDoc(doc(db, 'banners', 'home_banner'));
        if (snap.exists()) setBannerData(snap.data());
      } catch (err) {
        console.warn('HomeBanner: error al cargar', err);
      }
    })();
  }, []);

  /* ─── Auto-ciclo ──────────────────────────────────────────── */
  useEffect(() => {
    if (
      !bannerData?.active ||
      !bannerData.images?.length ||
      bannerData.images.length < 2
    ) return;

    const ms = bannerData.interval ?? 5000;

    const iv = setInterval(() => {
      if (phaseRef.current !== 'idle') return; // skip si ya animando
      const next = (shownRef.current + 1) % bannerData.images.length;
      nextRef.current = next;
      phaseRef.current = 'out';
      setAnimPhase('out');
    }, ms);

    return () => clearInterval(iv);
  }, [bannerData]);

  /* ─── Fases de animación ──────────────────────────────────── */
  useEffect(() => {
    if (animPhase === 'out') {
      const t = setTimeout(() => {
        // Punto medio: intercambiamos la imagen (invisible en este momento)
        shownRef.current = nextRef.current;
        setShown(nextRef.current);
        phaseRef.current = 'in';
        setAnimPhase('in');
      }, 360);
      return () => clearTimeout(t);
    }

    if (animPhase === 'in') {
      const t = setTimeout(() => {
        phaseRef.current = 'idle';
        setAnimPhase('idle');
      }, 360);
      return () => clearTimeout(t);
    }
  }, [animPhase]);

  /* ─── Guard: no renderizar si inactivo o sin imágenes ───────── */
  if (!bannerData?.active || !bannerData.images?.length) return null;

  /* ─── Slide actual ─────────────────────────────────────────── */
  const raw        = bannerData.images[shown];
  const desktopUrl = typeof raw === 'string' ? raw : raw?.url;
  const mobileUrl  = typeof raw === 'object'  ? raw?.mobileUrl : null;
  const rawLink    = typeof raw === 'object'  ? raw?.link      : null;

  // Solo consideramos link válido si es string con contenido real
  const hasLink = typeof rawLink === 'string' && rawLink.trim().length > 0;
  const link    = hasLink ? rawLink.trim() : null;

  /**
   * <picture> sirve la imagen correcta según el viewport:
   *  - ≤ 768 px → mobileUrl  (426 × 24 proporción, sin deformación)
   *  - > 768 px → desktopUrl (1398 × 54 proporción, sin deformación)
   */
  const imgEl = (
    <picture key={shown} className="home-banner-picture">
      {mobileUrl && (
        <source media="(max-width: 768px)" srcSet={mobileUrl} />
      )}
      <img
        src={desktopUrl}
        alt="Banner promocional"
        className="home-banner-img"
        onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
      />
    </picture>
  );

  return (
    <div className="home-banner-wrapper" aria-label="Banner promocional">
      <div className={`home-banner-card home-banner-card--${animPhase}`}>
        {hasLink ? (
          <a
            href={link}
            className="home-banner-link home-banner-link--clickable"
            target={link.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            {imgEl}
          </a>
        ) : (
          /* Sin link: div sin cursor ni comportamiento de navegación */
          <div className="home-banner-link">
            {imgEl}
          </div>
        )}
      </div>

      {/* Indicadores de puntos si hay más de 1 imagen */}
      {bannerData.images.length > 1 && (
        <div className="home-banner-dots" aria-hidden="true">
          {bannerData.images.map((_, i) => (
            <span
              key={i}
              className={`home-banner-dot ${i === shown ? 'home-banner-dot--active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}