import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'; // Agregué icono Right para subcategorías
import { api } from '../services/api'; 
import '../styles/CategorySidebar.css';

export function CategorySidebar({ onSelectCategory, isMobileOverlay = false }) {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await api.getCategories();
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleSubcategoryClick = (subName, parentName) => {
    if (onSelectCategory) {
      onSelectCategory({
        categoryName: subName,      // Subcategoría
        parentCategory: parentName  // Categoría Padre
      });
    }
  };

  // ✅ CORRECCIÓN AQUÍ:
  // Antes enviabas el nombre como 'categoryName' (que el padre interpretaba como subcategoría).
  // Ahora lo enviamos como 'parentCategory' y dejamos 'categoryName' en null.
  const handleParentCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory({
        categoryName: null,       // No hay subcategoría seleccionada
        parentCategory: catName   // Es una Categoría Principal
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const shouldShowList = isMobileOverlay || isMobileMenuOpen;

  if (loading) {
    return (
      <aside className={`category-sidebar ${isMobileOverlay ? 'overlay-mode' : ''}`}>
        {!isMobileOverlay && (
          <div className="sidebar-header">
             <h3>Categorías</h3>
          </div>
        )}
        <div className={`categories-list skeleton-list`}>
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="skeleton-item"></div>
           ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className={`category-sidebar ${isMobileOverlay ? 'overlay-mode' : ''}`}>
      {!isMobileOverlay && (
        <div className="sidebar-header" onClick={toggleMobileMenu}>
          <h3>Categorías</h3>
          <FaChevronDown className={`mobile-toggle-icon ${isMobileMenuOpen ? 'open' : ''}`} />
        </div>
      )}

      <div className={`categories-list ${shouldShowList ? 'show-mobile' : ''}`}>
        {categories.map((category) => (
          <div key={category.id} className="category-item-container">
            {/* Usamos un contenedor flex para separar el botón de texto del botón de flecha */}
            <div className="category-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                className="category-name-btn"
                style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', padding: '10px', fontSize: '1rem', cursor: 'pointer', color: '#2c3e50', fontWeight: 600 }}
                onClick={() => handleParentCategoryClick(category.name)}
              >
                {category.name}
              </button>
              
              {category.subcategories && category.subcategories.length > 0 && (
                <button 
                  className="expand-icon-btn"
                  style={{ background: 'none', border: 'none', padding: '10px', cursor: 'pointer', color: '#667eea' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.id);
                  }}
                >
                  <FaChevronDown style={{ transform: expandedCategory === category.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
              )}
            </div>

            {expandedCategory === category.id && (
              <div className="subcategories">
                {category.subcategories.map((sub, idx) => (
                  <button
                    key={idx} 
                    className="subcategory-button"
                    onClick={() => handleSubcategoryClick(sub.name, category.name)}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}