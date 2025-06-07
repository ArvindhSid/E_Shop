// src/pages/AddProduct/AddProduct.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../common/config';

export default function AddProduct({ token }) {
  const [form, setForm] = useState({
    name:'', category:'', price:0, description:'', manufacturer:'', availableItems:0
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    try {
      const res = await axios.post(
        `${API_BASE}/products`,
        form,
        { headers: { 'x-auth-token': token } }
      );
      if (res.status === 201) {
        setMessage('Product added!');
        setForm({ name:'', category:'', price:0, description:'', manufacturer:'', availableItems:0 });
      }
    } catch {
      setMessage('Failed to add product');
    }
  };

  return (
    <div style={{ padding:20 }}>
      <h2>Add Product</h2>
      {message && <p>{message}</p>}
      {Object.keys(form).map(key => (
        <div key={key} style={{ marginBottom:8 }}>
          <input
            type={['price','availableItems'].includes(key) ? 'number' : 'text'}
            placeholder={key}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}
