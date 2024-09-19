// pages/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import Link from 'next/link';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = () => {
    const categoryQuery = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
    axios.get(`https://${envApiUrl}/api/products?${categoryQuery}`)
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  };

  const fetchCategories = () => {
    axios.get(`https://${envApiUrl}/api/products?include_hidden=true`)
      .then(response => {
        const categories = [...new Set(response.data.map(product => product.category))];
        setCategories(categories);
      })
      .catch(error => console.error('Error fetching categories:', error));
  };

  return (
    <Layout>
      <h1>All Products</h1>
      <div>
        <label>
          Filter by Category:
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option value={category} key={index}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #000', margin: '10px', width: 'calc(33% - 20px)', padding: '10px' }}>
            <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <h2>{product.name}</h2>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
            <Link href={`/product/${product.id}`}>
              <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}>View Product</button>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
