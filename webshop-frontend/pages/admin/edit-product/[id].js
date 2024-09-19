// pages/admin/edit-product/[id].js
import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import axios from 'axios';
import { useRouter } from 'next/router';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

const EditProductPage = () => {
  const [product, setProduct] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      axios.get(`https://${envApiUrl}/api/products/${id}`)
        .then(response => setProduct(response.data))
        .catch(error => console.error('Error fetching product:', error));
    }
  }, [id]);

  const handleChange = e => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = e => {
    setProduct({ ...product, is_visible: e.target.checked ? 1 : 0 });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.put(`https://${envApiUrl}/api/products/${id}`, product);
      alert('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!product) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h1>Edit Product</h1>
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
          required
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
        <button
          type="submit"
          style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none', width: '100%' }}
        >
          Update Product
        </button>
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


      </form>
    </Layout>
  );
};

export default EditProductPage;
