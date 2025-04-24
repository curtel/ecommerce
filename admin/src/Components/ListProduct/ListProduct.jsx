import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/allproducts`);
            const data = await response.json();
            setAllProducts(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct({
            ...product,
            new_images: [],
            removed_images: []
        });
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_URL}/removeproduct`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id })
                });
                const data = await response.json();
                if (data.success) {
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                setError('Failed to delete product');
            }
        }
    };

    const handleImageUpload = async (event, isDetailImage = false) => {
        const files = Array.from(event.target.files);
        const formData = new FormData();
        
        for (let file of files) {
            formData.append('product', file);
            try {
                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    if (isDetailImage) {
                        setEditingProduct(prev => ({
                            ...prev,
                            new_images: [...prev.new_images, data.image_url]
                        }));
                    } else {
                        setEditingProduct(prev => ({
                            ...prev,
                            image: data.image_url
                        }));
                    }
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const handleRemoveDetailImage = (imageUrl) => {
        setEditingProduct(prev => ({
            ...prev,
            detail_images: prev.detail_images.filter(img => img !== imageUrl),
            removed_images: [...prev.removed_images, imageUrl]
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${API_URL}/updateproduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editingProduct,
                    detail_images: [
                        ...editingProduct.detail_images,
                        ...editingProduct.new_images
                    ].filter(img => !editingProduct.removed_images.includes(img))
                })
            });
            const data = await response.json();
            if (data.success) {
                setShowEditModal(false);
                fetchProducts();
            }
        } catch (error) {
            console.error('Error updating product:', error);
            setError('Failed to update product');
        }
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="list-product">
            <div className="list-product-header">
                <h1 className="list-product-title">Product List</h1>
                <button className="add-product-button" onClick={() => navigate('/addproduct')}>
                    <AddIcon /> Add New Product
                </button>
            </div>

            <div className="product-grid">
                {allproducts.map((product) => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            <img src={product.image} alt={product.name} className="product-image" />
                        </div>
                        <div className="product-details">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-info">
                                <div className="info-item">
                                    <span className="info-label">Price</span>
                                    <span className="info-value">${product.new_price}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Old Price</span>
                                    <span className="info-value">${product.old_price}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">{product.category}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Type</span>
                                    <span className="info-value">{product.clothingType}</span>
                                </div>
                            </div>
                            <div className="product-actions">
                                <button className="action-button edit-button" onClick={() => handleEdit(product)}>
                                    <EditIcon /> Edit
                                </button>
                                <button className="action-button delete-button" onClick={() => handleDelete(product.id)}>
                                    <DeleteIcon /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showEditModal && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Product</h2>
                            <button className="close-button" onClick={() => setShowEditModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-input"
                                value={editingProduct.category}
                                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                            >
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Clothing Type</label>
                            <select
                                className="form-input"
                                value={editingProduct.clothingType}
                                onChange={(e) => setEditingProduct({...editingProduct, clothingType: e.target.value})}
                            >
                                <option value="shirt">Shirt</option>
                                <option value="pants">Pants</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Price</label>
                            <input
                                type="number"
                                className="form-input"
                                value={editingProduct.new_price}
                                onChange={(e) => setEditingProduct({...editingProduct, new_price: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Old Price</label>
                            <input
                                type="number"
                                className="form-input"
                                value={editingProduct.old_price}
                                onChange={(e) => setEditingProduct({...editingProduct, old_price: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Main Image</label>
                            <input
                                type="file"
                                className="form-input"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, false)}
                            />
                            {editingProduct.image && (
                                <img src={editingProduct.image} alt="Main" className="preview-image" />
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Detail Images</label>
                            <input
                                type="file"
                                className="form-input"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e, true)}
                            />
                            <div className="image-preview">
                                {editingProduct.detail_images.map((img, index) => (
                                    <div key={index} className="preview-image-container">
                                        <img src={img} alt={`Detail ${index}`} className="preview-image" />
                                        <button
                                            className="remove-image"
                                            onClick={() => handleRemoveDetailImage(img)}
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                ))}
                                {editingProduct.new_images.map((img, index) => (
                                    <div key={`new-${index}`} className="preview-image-container">
                                        <img src={img} alt={`New Detail ${index}`} className="preview-image" />
                                        <button
                                            className="remove-image"
                                            onClick={() => setEditingProduct(prev => ({
                                                ...prev,
                                                new_images: prev.new_images.filter(i => i !== img)
                                            }))}
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="save-button" onClick={handleSave}>
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ListProduct
