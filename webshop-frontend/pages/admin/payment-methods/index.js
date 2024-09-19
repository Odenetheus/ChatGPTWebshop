// pages/admin/payment-methods/index.js
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import axios from 'axios';
import Link from 'next/link';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const PaymentMethodsAdmin = () => {
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`http://${envApiUrl}/api/payment_methods`);
      setMethods(response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const deleteMethod = async (id) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      try {
        await axios.delete(`http://${envApiUrl}/api/payment_methods/${id}`);
        fetchPaymentMethods();
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  return (
    <Layout>
      <h1>Manage Payment Methods</h1>
      <Link href="/admin/payment-methods/add">
        <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}>
          Add Payment Method
        </button>
      </Link>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Type</th>
            <th style={{ border: '1px solid #000', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {methods.map(method => (
            <tr key={method.id}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{method.id}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{method.name}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{method.type}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>
                <Link href={`/admin/payment-methods/edit/${method.id}`}>
                  <button style={{ marginRight: '10px' }}>Edit</button>
                </Link>
                <button onClick={() => deleteMethod(method.id)} style={{ backgroundColor: 'red', color: '#fff' }}>
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

export default PaymentMethodsAdmin;
