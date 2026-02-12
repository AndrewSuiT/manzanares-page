import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ProductCard } from './ProductCard';

// Importar estilos de la librería
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import '../styles/ProductSlider.css';

// Botón "Siguiente" personalizado (Flecha derecha)
function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className="slick-arrow custom-next"
      onClick={onClick}
    >
      <FaChevronRight />
    </div>
  );
}

// Botón "Anterior" personalizado (Flecha izquierda)
function PrevArrow(props) {
  const { className, style, onClick } = props;
  // Ocultamos la flecha izquierda si no hay scroll previo (opcional, slick lo maneja con clases disabled)
  return (
    <div
      className="slick-arrow custom-prev"
      onClick={onClick}
    >
      <FaChevronLeft />
    </div>
  );
}

export function ProductSlider({ title, products, viewAllLink, onAddToCart }) {
  if (!products || products.length === 0) return null;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: windowSize.width < 768 ? 2.2 : (windowSize.width < 1024 ? 3 : 4),
    slidesToScroll: windowSize.width < 768 ? 2.2 : (windowSize.width < 1024 ? 3 : 4),
    initialSlide: 0,
    nextArrow: windowSize.width < 768 ? undefined : <NextArrow />,
    prevArrow: windowSize.width < 768 ? undefined : <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3, slidesToScroll: 3 }
      },
      {
        breakpoint: 1024, 
        settings: { slidesToShow: 3, slidesToScroll: 3 }
      },
      {
        breakpoint: 768, 
        settings: {
          slidesToShow: 2.2,
          slidesToScroll: 2,
          arrows: false
        }
      },
      {
        breakpoint: 480, 
        settings: {
          slidesToShow: 2.2,
          slidesToScroll: 2,
          arrows: false
        }
      }
    ]
  };

  return (
    <div className="product-slider-section">
      <div className="slider-header">
        <h2>{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="view-all-link">
            Ver todos &rarr;
          </Link>
        )}
      </div>

      <div className="slider-container-slick">
        <Slider {...settings}>
          {products.map((product) => (
            /* Agregamos una clase para controlar la altura */
            <div key={product.id} className="slick-slide-item">
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}