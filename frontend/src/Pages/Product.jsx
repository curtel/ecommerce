import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom'
import Breadcrums from '../Components/Breadcrums/Breadcrums'
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay'
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox'
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts'
import { API_URL } from '../config';

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // First try to find the product in the context
        const contextProduct = all_product.find((e) => e.id === Number(productId));
        if (contextProduct) {
          setProduct(contextProduct);
          setLoading(false);
          return;
        }

        // If not found in context, fetch from backend
        const response = await fetch(`${API_URL}/product/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, all_product]);

  if (loading) {
    return <div className="product-loading">Loading...</div>;
  }

  if (error) {
    return <div className="product-error">Error: {error}</div>;
  }

  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  return (
    <div>
      <Breadcrums product={product}/>
      <ProductDisplay product={product}/>
      <DescriptionBox/>
      <RelatedProducts/>
    </div>
  )
}

export default Product
