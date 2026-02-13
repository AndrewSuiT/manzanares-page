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
    // Detectar tipo de acción. Si no tiene, asumir categoría por compatibilidad
    const actionType = slide.actionType || (slide.category ? 'category' : 'category');
    
    // Preparar variable para los IDs destacados (array de strings en Firestore)
    let highlightParam = '';
    if (slide.highlightedProducts && Array.isArray(slide.highlightedProducts) && slide.highlightedProducts.length > 0) {
        highlightParam = `&highlight=${slide.highlightedProducts.join(',')}`;
    }

    if (actionType === 'category') {
      // Caso 1: Categoría simple
      const categoryValue = slide.actionValue || slide.category;
      navigate(`/productos?category=${categoryValue}${highlightParam}`);

    } else if (actionType === 'subcategory') {
      // Caso 2: Subcategoría (formato "Categoria|Subcategoria")
      const val = slide.actionValue || '';
      if (val.includes('|')) {
        const [cat, sub] = val.split('|');
        navigate(`/productos?category=${cat}&subcategory=${sub}${highlightParam}`);
      } else {
        // Fallback si está mal formateado
        navigate(`/productos?category=${val}${highlightParam}`);
      }

    } else if (actionType === 'product') {
      // Caso 3: Producto directo (no necesita highlight)
      navigate(`/producto/${slide.actionValue}`);

    } else if (actionType === 'search') {
      // Caso 4: Búsqueda
      navigate(`/buscar?q=${slide.actionValue}`); // Normalmente búsqueda no usa highlight, pero podrías agregarlo si quisieras

    } else if (actionType === 'url') {
      // Caso 5: URL Externa
      window.open(slide.actionValue, '_blank');
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