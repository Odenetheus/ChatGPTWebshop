// pages/admin/add-product.js
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';


const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddProductPage = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_visible: 1,
    category: '', // Added
    stock: '',    // Added
  });

  const handleChange = e => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = e => {
    setProduct({ ...product, is_visible: e.target.checked ? 1 : 0 });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`https://${envApiUrl}/api/products`, product);
      alert('Product added successfully');
      setProduct({ name: '', description: '', price: '', image_url: '', is_visible: 1, category: '', stock: '' });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Layout>
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <textarea
          name="description"
          placeholder="Product Description"
          value={product.description}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '100px' }}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          step="0.01"
          value={product.price}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={product.image_url}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="checkbox"
            name="is_visible"
            checked={product.is_visible === 1}
            onChange={handleCheckboxChange}
          />
          {' '}Visible
        </label>
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={product.category}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={product.stock}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          type="submit"
          style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none', width: '100%' }}
        >
          Add Product
        </button>

      </form>
    </Layout>
  );
};

export default AddProductPage;
