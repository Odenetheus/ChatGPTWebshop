// pages/checkout.js
import React, { useContext, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { useRouter } from 'next/router';

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const [email, setEmail] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payment_methods');
      setPaymentMethods(response.data);
      if (response.data.length > 0) {
        setSelectedMethod(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

// pages/checkout.js (Update the handleCheckout function)
const handleCheckout = async () => {
    // Event tracking: Checkout initiated
    await axios.post('http://localhost:5000/api/events', { event: 'checkout_initiated' });
  
    const orderDetails = cart.map(item => `${item.name} - $${item.price.toFixed(2)}`).join('\n');
    try {
      if (selectedMethod) {
        const method = paymentMethods.find(m => m.id === selectedMethod);
  
        if (method.type === 'embed') {
          // Handle embedded code payment methods (not implemented in this example)
          alert('Embedded payment methods are not implemented in this demo.');
        } else if (method.type === 'http_chain') {
          // Handle HTTP request chain payment methods
          const response = await axios.post('http://localhost:5000/api/process_payment', {
            method_id: selectedMethod,
            payment_data: { email, orderDetails, amount: totalPrice },
          });
  
          if (response.status === 200) {
            // Event tracking: Payment confirmed
            await axios.post('http://localhost:5000/api/events', { event: 'payment_confirmed' });
  
            // Send checkout data to backend
            await axios.post('http://localhost:5000/api/checkout', {
              email,
              cart,
            });
  
            clearCart();
            router.push('/thank-you');
          }
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing payment.');
    }
  };
  

  const totalPrice = cart.reduce((total, product) => total + product.price, 0);

  return (
    <Layout>
      <h1>Checkout</h1>
      <p>Please enter your email to receive the invoice:</p>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
      />
      <div>
        <h2>Select Payment Method</h2>
        {paymentMethods.map(method => (
          <div key={method.id}>
            <label>
              <input
                type="radio"
                name="payment_method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
              />
              {' '}{method.name}
            </label>
          </div>
        ))}
      </div>
      {/* Handle embedded code if selected */}
      {selectedMethod && paymentMethods.find(m => m.id === selectedMethod)?.type === 'embed' && (
        <div dangerouslySetInnerHTML={{ __html: paymentMethods.find(m => m.id === selectedMethod).embed_code }} />
      )}
      <button
        onClick={handleCheckout}
        style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none', width: '100%' }}
      >
        Confirm Purchase
      </button>
    </Layout>
  );
};

export default CheckoutPage;
