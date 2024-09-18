// pages/admin/products.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import Link from 'next/link';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products?include_hidden=true')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Layout>
      <h1>Admin - Manage Products</h1>
      <Link href="/admin/add-product">
        <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}>
          Add New Product
        </button>
      </Link>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Price</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Visibility</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{product.id}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{product.name}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>${product.price.toFixed(2)}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>
                {product.is_visible ? 'Visible' : 'Hidden'}
              </td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>
                <Link href={`/admin/edit-product/${product.id}`}>
                  <button style={{ marginRight: '10px' }}>Edit</button>
                </Link>
                <button onClick={() => deleteProduct(product.id)} style={{ backgroundColor: 'red', color: '#fff' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default AdminProductList;
