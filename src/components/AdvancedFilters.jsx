import { useState, useEffect } from 'react';
import '../styles/AdvancedFilters.css';

export function AdvancedFilters({ 
  products, 
  onServerFilterChange, 
  onBrandChange, 
  availableBrands = [], 
  selectedBrand,
  initialFilters = {}, 
  categoryKey 
}) {
  // 1. AUMENTAMOS EL LÍMITE INICIAL (De 5000 a 15000 o lo que prefieras)
  const DEFAULT_MAX = 15000;

  const [priceRange, setPriceRange] = useState([
    initialFilters.minPrice || 0, 
    initialFilters.maxPrice || DEFAULT_MAX
  ]);
  
  const [sortOrder, setSortOrder] = useState(initialFilters.sort || 'relevance');
  
  // Límites visuales del slider
  const [sliderLimits, setSliderLimits] = useState([0, DEFAULT_MAX]);

  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    price: true,
    brands: true 
  });
  
  // Calcular límites basados en productos cargados (solo si superan el default)
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(p => p.price || 0);
      const maxPriceFound = Math.ceil(Math.max(...prices));
      
      // Solo expandimos el límite si encontramos un producto más caro que el límite actual
      if (maxPriceFound > sliderLimits[1]) {
        setSliderLimits(prev => [prev[0], maxPriceFound + 100]);
      }
    }
  }, [products]);

  useEffect(() => {
    setPriceRange([initialFilters.minPrice || 0, initialFilters.maxPrice || sliderLimits[1]]);
    setSortOrder('relevance');
  }, [categoryKey]);

  // --- MANEJADORES ---

  // A. Slider (Arrastrar)
  const handlePriceDrag = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange(prev => {
      if (type === 'min') {
        const newMin = Math.min(value, prev[1] - 10);
        return [newMin, prev[1]];
      } else {
        const newMax = Math.max(value, prev[0] + 10);
        return [prev[0], newMax];
      }
    });
  };

  // B. Inputs Manuales (Escribir)
  const handleManualInput = (e, type) => {
    // Permitir escribir libremente, la validación ocurre al soltar (onBlur)
    const valStr = e.target.value;
    const val = valStr === '' ? '' : parseInt(valStr);

    setPriceRange(prev => {
      if (type === 'min') return [val, prev[1]];
      return [prev[0], val];
    });
  };

  // C. Commit (Al soltar slider o salir del input)
  const handlePriceCommit = () => {
    let [min, max] = priceRange;

    // Validaciones básicas para que no queden vacíos o invertidos
    if (min === '' || min < 0) min = 0;
    if (max === '' || max === 0) max = sliderLimits[1];
    if (min > max) min = max - 10;

    // Si el usuario escribió un número mayor al límite del slider, expandimos el slider
    if (max > sliderLimits[1]) {
      setSliderLimits([sliderLimits[0], max]);
    }

    setPriceRange([min, max]); // Actualizamos UI corregida

    // Enviamos al servidor
    onServerFilterChange({
      minPrice: min,
      maxPrice: max,
      sort: sortOrder
    });
  };

  // Detectar tecla Enter en los inputs
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePriceCommit();
    }
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
    onServerFilterChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sort: newSort
    });
  };

  const resetFilters = () => {
    setPriceRange([0, DEFAULT_MAX]);
    setSliderLimits([0, DEFAULT_MAX]);
    setSortOrder('relevance');
    onServerFilterChange({ minPrice: null, maxPrice: null, sort: 'relevance' });
    if (onBrandChange) onBrandChange(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <h3>Filtros</h3>
        <button className="reset-filters-btn" onClick={resetFilters}>Limpiar</button>
      </div>

      {/* ORDENAR */}
      <div className="filter-section">
        <button className="filter-title" onClick={() => toggleSection('sort')}>
          <span>📃 Ordenar por</span>
          <span className={`arrow ${expandedSections.sort ? 'expanded' : ''}`}>▼</span>
        </button>
        {expandedSections.sort && (
          <div className="filter-content radio-group">
            {[
              { id: 'relevance', label: 'Relevancia' },
              { id: 'price-asc', label: 'Precio: Menor a Mayor' },
              { id: 'price-desc', label: 'Precio: Mayor a Menor' },
              { id: 'alpha-asc', label: 'Nombre: A - Z' }
            ].map((option) => (
              <label key={option.id}>
                <input 
                  type="radio" 
                  name="sort" 
                  checked={sortOrder === option.id} 
                  onChange={() => handleSortChange(option.id)} 
                /> 
                {option.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* PRECIO EDITABLE */}
      <div className="filter-section">
        <button className="filter-title" onClick={() => toggleSection('price')}>
          <span>💰 Precio</span>
          <span className={`arrow ${expandedSections.price ? 'expanded' : ''}`}>▼</span>
        </button>
        {expandedSections.price && (
          <div className="filter-content">
            <div className="price-inputs">
              {/* INPUT MÍNIMO */}
              <div className="price-input-wrapper">
                <span className="currency-symbol">S/</span>
                <input 
                  type="number" 
                  className="price-input"
                  value={priceRange[0]}
                  onChange={(e) => handleManualInput(e, 'min')}
                  onBlur={handlePriceCommit}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <span className="separator">-</span>
              {/* INPUT MÁXIMO */}
              <div className="price-input-wrapper">
                <span className="currency-symbol">S/</span>
                <input 
                  type="number" 
                  className="price-input"
                  value={priceRange[1]}
                  onChange={(e) => handleManualInput(e, 'max')}
                  onBlur={handlePriceCommit}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            
            <div 
              className="range-slider-container" 
              onMouseUp={handlePriceCommit} 
              onTouchEnd={handlePriceCommit}
            >
              <input 
                type="range" 
                min={sliderLimits[0]} 
                max={sliderLimits[1]} 
                value={priceRange[0]} 
                onChange={(e) => handlePriceDrag(e, 'min')} 
                className="price-range-thumb thumb-left"
                style={{ zIndex: priceRange[0] > sliderLimits[1] - 100 ? 5 : 3 }}
              />
              <input 
                type="range" 
                min={sliderLimits[0]} 
                max={sliderLimits[1]} 
                value={priceRange[1]} 
                onChange={(e) => handlePriceDrag(e, 'max')} 
                className="price-range-thumb thumb-right"
              />
              <div className="price-slider-track">
                <div 
                  className="price-slider-range"
                  style={{
                    left: `${((priceRange[0] - sliderLimits[0]) / (sliderLimits[1] - sliderLimits[0])) * 100}%`,
                    width: `${((priceRange[1] - priceRange[0]) / (sliderLimits[1] - sliderLimits[0])) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
              * Escribe o desliza para filtrar
            </div>
          </div>
        )}
      </div>

      {/* MARCAS */}
      {availableBrands.length > 0 && (
        <div className="filter-section">
          <button className="filter-title" onClick={() => toggleSection('brands')}>
            <span>🏷️ Marcas ({availableBrands.length})</span>
            <span className={`arrow ${expandedSections.brands ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedSections.brands && (
            <div className="filter-content brands-list">
              {availableBrands.map(brand => (
                <label key={brand} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedBrand === brand} 
                    onChange={() => onBrandChange(brand === selectedBrand ? null : brand)}
                  />
                  {brand}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}