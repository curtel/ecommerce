import React, { useContext, useEffect, useState } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext'
import Item from '../Components/Item/Item'

const ShopCategory = (props) => {
    console.log('[ShopCategory] props.category:', props.category);
    const { 
        all_product, 
        loading, 
        error,
        currentPage,
        totalPages,
        loadMoreProducts,
        updateFilters,
        initialFetchDone,
        sortOption
    } = useContext(ShopContext);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [selectedSort, setSelectedSort] = useState(sortOption || 'newest');
    const [selectedFilters, setSelectedFilters] = useState({
        category: [],
        color: [],
        material: [],
        size: []
    });
    const [appliedFilters, setAppliedFilters] = useState({
        category: [],
        color: [],
        material: [],
        size: []
    });

    useEffect(() => {
        // Only fetch if we have a category to fetch or we need the initial data
        if (props.category || !initialFetchDone) {
            updateFilters(props.category);
        }
    }, [props.category, initialFetchDone]);

    const filterOptions = {
        category: ['shirt', 'pants', 't-shirt', 'dress'],
        color: ['Beige', 'Black', 'Blue', 'Brown', 'Green', 'Grey', 'Multicolor', 'Pink', 'Red', 'White', 'Yellow'],
        material: ['Cotton', 'Denim', 'Leather', 'Linen', 'Polyester', 'Wool'],
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'popularity', label: 'Most Popular' }
    ];

    const getBannerContent = (category) => {
        switch(category) {
            case 'men':
                return {
                    title: "Modern Gentleman",
                    subtitle: "Discover our curated collection of sophisticated menswear. From tailored essentials to contemporary classics, elevate your style with premium quality and timeless design.",
                    image: "https://images.unsplash.com/photo-1665681496584-1f44d8c54d62?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                };
            case 'women':
                return {
                    title: "Effortless Elegance",
                    subtitle: "Explore our latest collection of women's fashion. From casual chic to evening glamour, find pieces that express your unique style.",
                    image: "https://images.unsplash.com/photo-1651335794520-fb1066d93a84?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                };
            default:
                return {
                    title: "Discover Our Collection",
                    subtitle: "Quality fashion for every style and occasion.",
                    image: "https://images.unsplash.com/photo-1665681496584-1f44d8c54d62?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                };
        }
    };

    const handleFilterClick = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const toggleFilter = (section, value) => {
        setSelectedFilters(prev => {
            const newFilters = { ...prev };
            if (newFilters[section].includes(value)) {
                newFilters[section] = newFilters[section].filter(item => item !== value);
            } else {
                newFilters[section] = [...newFilters[section], value];
            }
            return newFilters;
        });
    };

    const handleApplyFilters = () => {
        setAppliedFilters(selectedFilters);
        updateFilters(props.category, { ...selectedFilters, sort: selectedSort });
        setIsFilterModalOpen(false);
    };

    const handleResetFilters = () => {
        setSelectedFilters({
            category: [],
            color: [],
            material: [],
            size: []
        });
        setAppliedFilters({
            category: [],
            color: [],
            material: [],
            size: []
        });
        setSelectedSort(sortOption || 'newest');
        updateFilters(props.category);
    };

    const getAppliedFiltersCount = () => {
        return Object.values(appliedFilters).flat().length;
    };

    const handleLoadMore = () => {
        loadMoreProducts(props.category);
    };

    const bannerContent = getBannerContent(props.category);

    if (loading && currentPage === 1) {
        return (
            <div className='shop-category'>
                <div className="shopcategory-banner" style={{backgroundImage: `url(${bannerContent.image})`}}>
                    <div className="banner-content">
                        <h1 className="banner-title">{bannerContent.title}</h1>
                        <p className="banner-subtitle">{bannerContent.subtitle}</p>
                    </div>
                </div>
                <div className="shopcategory-products loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='shop-category'>
                <div className="shopcategory-banner" style={{backgroundImage: `url(${bannerContent.image})`}}>
                    <div className="banner-content">
                        <h1 className="banner-title">{bannerContent.title}</h1>
                        <p className="banner-subtitle">{bannerContent.subtitle}</p>
                    </div>
                </div>
                <div className="shopcategory-products error">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className='shop-category'>
            <div className="shopcategory-banner" style={{backgroundImage: `url(${bannerContent.image})`}}>
                <div className="banner-content">
                    <h1 className="banner-title">{bannerContent.title}</h1>
                    <p className="banner-subtitle">{bannerContent.subtitle}</p>
                </div>
            </div>
            
            <button className="filter-sort-button" onClick={() => setIsFilterModalOpen(true)}>
                <span>
                    Filter & Sort
                    {getAppliedFiltersCount() > 0 && ` (${getAppliedFiltersCount()})`}
                </span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 18L20 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 12L20 12" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 6L20 6" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>

            {/* Filter Modal */}
            <div className={`filter-overlay ${isFilterModalOpen ? 'open' : ''}`} onClick={() => setIsFilterModalOpen(false)} />
            <div className={`filter-modal ${isFilterModalOpen ? 'open' : ''}`}>
                <div className="filter-modal-header">
                    <h2>Filter & Sort</h2>
                    <button className="filter-modal-close" onClick={() => setIsFilterModalOpen(false)}>×</button>
                </div>

                {/* Sort Options */}
                <div className="filter-section">
                    <div className="filter-section-header" onClick={() => handleFilterClick('sort')}>
                        <span>Sort By</span>
                        <span>{activeSection === 'sort' ? '−' : '+'}</span>
                    </div>
                    <div className={`filter-section-content ${activeSection === 'sort' ? 'open' : ''}`}>
                        {sortOptions.map(option => (
                            <div key={option.value} className="filter-option">
                                <div 
                                    className={`filter-radio ${selectedSort === option.value ? 'checked' : ''}`}
                                    onClick={() => setSelectedSort(option.value)}
                                >
                                    {selectedSort === option.value && '●'}
                                </div>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="filter-sections">
                    {Object.entries(filterOptions).map(([section, options]) => (
                        <div key={section} className="filter-section">
                            <div className="filter-section-header" onClick={() => handleFilterClick(section)}>
                                <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                <span>{activeSection === section ? '−' : '+'}</span>
                            </div>
                            <div className={`filter-section-content ${activeSection === section ? 'open' : ''}`}>
                                {options.map(option => (
                                    <div key={option} className="filter-option">
                                        <div 
                                            className={`filter-checkbox ${selectedFilters[section].includes(option) ? 'checked' : ''}`}
                                            onClick={() => toggleFilter(section, option)}
                                        >
                                            {selectedFilters[section].includes(option) && '✓'}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="filter-modal-footer">
                    <button className="reset-button" onClick={handleResetFilters}>
                        Reset all filters
                    </button>
                    <button className="apply-button" onClick={handleApplyFilters}>
                        See the {all_product.filter(item => {
                            // Filter by category
                            if (selectedFilters.category.length > 0 && !selectedFilters.category.includes(item.clothingType)) {
                                return false;
                            }
                            // Filter by color
                            if (selectedFilters.color.length > 0 && !selectedFilters.color.includes(item.color)) {
                                return false;
                            }
                            // Filter by material
                            if (selectedFilters.material.length > 0 && !selectedFilters.material.includes(item.material)) {
                                return false;
                            }
                            // Filter by size
                            if (selectedFilters.size.length > 0 && !selectedFilters.size.some(size => item.available_sizes.includes(size))) {
                                return false;
                            }
                            return true;
                        }).length} product(s)
                    </button>
                </div>
            </div>

            <div className="shopcategory-products">
                {all_product.length > 0 ? (
                    all_product.map((item, i) => (
                        <Item 
                            key={`${item.id}-${i}`}
                            id={item.id} 
                            name={item.name} 
                            image={item.image} 
                            new_price={item.new_price} 
                            old_price={item.old_price} 
                        />
                    ))
                ) : (
                    <div className="no-products">No products found in this category</div>
                )}
            </div>

            {currentPage < totalPages && (
                <div className="shopcategory-loadmore" onClick={handleLoadMore}>
                    {loading ? 'Loading...' : 'Explore More'}
                </div>
            )}
        </div>
    )
}

export default ShopCategory
