import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/Carousel.css';

export function Carousel({ images = [] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Asignamos las imágenes
  const slides = images;

  // --- 1. HOOKS (Siempre al principio) ---

  useEffect(() => {
    // Si no hay imágenes, no hacemos nada
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // --- 2. FUNCIONES AUXILIARES ---

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handlePromotionClick = (slide) => {
    const actionType = slide.actionType || (slide.category ? 'category' : 'category');
    const actionValue = slide.actionValue || slide.category;

    if (!actionValue) return;

    switch (actionType) {
      case 'category':
        navigate(`/productos?category=${encodeURIComponent(actionValue)}`);
        break;

      // SOLUCIÓN AL ERROR: Añadimos llaves {} aquí para evitar error de sintaxis con 'const'
      case 'subcategory': {
        const parts = actionValue.split('|');
        if (parts.length === 2) {
          navigate(`/productos?category=${encodeURIComponent(parts[0])}&subcategory=${encodeURIComponent(parts[1])}`);
        } else {
          navigate(`/productos?category=${encodeURIComponent(actionValue)}`);
        }
        break;
      }

      case 'product':
        navigate(`/producto/${actionValue}`);
        break;

      case 'search':
        navigate(`/buscar?q=${encodeURIComponent(actionValue)}`);
        break;

      case 'url':
        window.open(actionValue, '_blank');
        break;

      default:
        console.warn('Tipo de acción desconocido:', actionType);
    }
  };

  // --- 3. RENDERIZADO CONDICIONAL (Al final) ---

  // Si NO hay imágenes, mostramos el Skeleton (Carga)
  if (slides.length === 0) {
    return (
      <div className="carousel skeleton-container">
        <div className="skeleton-banner"></div>
      </div>
    );
  }

  // Si HAY imágenes, mostramos el carrusel normal
  return (
    <div className="carousel">
      <div className="carousel-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handlePromotionClick(slide)}
            style={{
              cursor: 'pointer',
              pointerEvents: index === currentIndex ? 'auto' : 'none',
              zIndex: index === currentIndex ? 10 : 0
            }}
          >
            {/* --- CAMBIO AQUÍ: Usamos <picture> para alternar imágenes --- */}
            <picture>
              {/* 1. Si existe mobileUrl, úsala en pantallas menores a 768px */}
              {slide.mobileUrl && (
                <source media="(max-width: 768px)" srcSet={slide.mobileUrl} />
              )}

              {/* 2. Imagen por defecto (Desktop) o fallback */}
              <img
                src={slide.url}
                alt={slide.title}
                className="carousel-image" // Clase útil para CSS
              />
            </picture>
            {/* ----------------------------------------------------------- */}

            <div className="slide-overlay">
              {slide.title && <h2>{slide.title}</h2>}
            </div>
          </div>
        ))}
      </div>

      {/* Solo mostramos controles si hay más de 1 imagen */}
      {slides.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={goToPrevious}>
            <FaChevronLeft />
          </button>
          <button className="carousel-btn next" onClick={goToNext}>
            <FaChevronRight />
          </button>

          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}