// pages/admin/orders.js
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios.get('http://localhost:5000/api/orders')
      .then(response => setOrders(response.data))
      .catch(error => console.error('Error fetching orders:', error));
  };

  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(`http://localhost:5000/api/orders/${orderId}`, { order_status: newStatus })
      .then(() => {
        alert('Order status updated');
        fetchOrders();
      })
      .catch(error => console.error('Error updating order status:', error));
  };

  return (
    <Layout>
      <h1>Admin - Orders</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Email</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Order Date</th>
            <th>Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.product_name}</td>
              <td>{order.email}</td>
              <td>{order.quantity}</td>
              <td>${order.total_price.toFixed(2)}</td>
              <td>{order.order_date}</td>
              <td>{order.order_status}</td>
              <td>
                <select value={order.order_status} onChange={e => updateOrderStatus(order.id, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default AdminOrdersPage;
