import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar     from './components/Navbar/Navbar';
import Login      from './pages/Login/Login';
import Signup     from './pages/Signup/Signup';
import Home       from './pages/Home/Home';
import AddProduct from './pages/AddProduct/AddProduct';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role,  setRole]  = useState(localStorage.getItem('role')  || '');

  const handleLogin = (tok, rol) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('role',  rol);
    setToken(tok);
    setRole(rol);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setRole('');
  };

  const isAdmin = role === 'ADMIN';

  return (
    <BrowserRouter>
      <Navbar token={token} isAdmin={isAdmin} onLogout={handleLogout} />

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            token
              ? <Navigate to="/" replace />
              : <Login onLogin={handleLogin} />
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            token
              ? <Navigate to="/" replace />
              : <Signup />
          }
        />

        {/* PRODUCTS */}
        <Route
          path="/"
          element={
            token
              ? <Home token={token} isAdmin={isAdmin} />
              : <Navigate to="/login" replace />
          }
        />

        {/* ADD PRODUCT */}
        <Route
          path="/add-product"
          element={
            isAdmin
              ? <AddProduct token={token} />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
