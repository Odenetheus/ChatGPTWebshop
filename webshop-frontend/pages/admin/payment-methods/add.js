// pages/admin/payment-methods/add.js
import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import axios from 'axios';
import { useRouter } from 'next/router';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const AddPaymentMethod = () => {
  const [method, setMethod] = useState({
    name: '',
    type: 'embed', // default to 'embed'
    embed_code: '',
    http_chain: [], // Will be an array of HTTP request steps
  });
  const router = useRouter();

  const handleChange = e => {
    setMethod({ ...method, [e.target.name]: e.target.value });
  };

  const handleTypeChange = e => {
    setMethod({ ...method, type: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`http://${envApiUrl}/api/payment_methods`, method);
      alert('Payment method added successfully');
      router.push('/admin/payment-methods');
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  return (
    <Layout>
      <h1>Add Payment Method</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Payment Method Name"
          value={method.name}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <label>
          Type:
          <select name="type" value={method.type} onChange={handleTypeChange} style={{ marginLeft: '10px' }}>
            <option value="embed">Embed Code</option>
            <option value="http_chain">HTTP Request Chain</option>
          </select>
        </label>
        {method.type === 'embed' ? (
          <div style={{ marginTop: '10px' }}>
            <textarea
              name="embed_code"
              placeholder="Embed Code"
              value={method.embed_code}
              onChange={handleChange}
              style={{ width: '100%', height: '200px', padding: '10px', marginBottom: '10px' }}
            />
          </div>
        ) : (
          <HttpChainBuilder method={method} setMethod={setMethod} />
        )}
        <button
          type="submit"
          style={{ backgroundColor: '#000', color: '#fff', padding: '10px', border: 'none' }}
        >
          Add Payment Method
        </button>
      </form>
    </Layout>
  );
};

// Component to build HTTP request chain
const HttpChainBuilder = ({ method, setMethod }) => {
  const [step, setStep] = useState({ method: 'POST', url: '', headers: {}, body: {} });

  const addStep = () => {
    setMethod({
      ...method,
      http_chain: [...method.http_chain, step],
    });
    setStep({ method: 'POST', url: '', headers: {}, body: {} });
  };

  const handleStepChange = e => {
    setStep({ ...step, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <h3>HTTP Request Chain</h3>
      <div>
        <label>
          Method:
          <select name="method" value={step.method} onChange={handleStepChange} style={{ marginLeft: '10px' }}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            {/* Add other methods as needed */}
          </select>
        </label>
      </div>
      <div>
        <input
          type="text"
          name="url"
          placeholder="URL"
          value={step.url}
          onChange={handleStepChange}
          style={{ width: '100%', padding: '10px', marginTop: '10px' }}
        />
      </div>
      {/* Implement inputs for headers and body if needed */}
      <button type="button" onClick={addStep} style={{ marginTop: '10px' }}>
        Add Step
      </button>
      <div style={{ marginTop: '20px' }}>
        <h4>Current Chain:</h4>
        <ol>
          {method.http_chain.map((s, index) => (
            <li key={index}>
              {s.method} {s.url}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default AddPaymentMethod;
