import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Order from './pages/Order/Order'; // Import the new Order component

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || ''); // Using role state as per your original App.js
  const [searchQuery, setSearchQuery] = useState(''); // Added for search functionality

  useEffect(() => {
    // This useEffect is typically used for side effects,
    // such as initial data fetching or authentication checks on component mount.
    // For this example, we trust localStorage.
  }, []);

  const handleLogin = (tok, rol) => { // Using tok, rol parameters as per your original App.js
    localStorage.setItem('token', tok);
    localStorage.setItem('role', rol);
    setToken(tok);
    setRole(rol);
  };

  const handleLogout = () => {
    localStorage.clear(); // Using localStorage.clear() as per your original App.js
    setToken('');
    setRole('');
    setSearchQuery(''); // Clear search query on logout
  };

  const isAdmin = role === 'ADMIN'; // Deriving isAdmin from role as per your original App.js

  const handleSearchProducts = (query) => { // Handler for search functionality
    setSearchQuery(query);
  };

  return (
    <Router>
      <Navbar
        token={token}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onSearch={handleSearchProducts} // Pass search handler to Navbar
      />
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

        {/* PRODUCT LISTING */}
        <Route
          path="/"
          element={
            token
              ? <Home token={token} isAdmin={isAdmin} searchQuery={searchQuery} /> // Pass searchQuery to Home
              : <Navigate to="/login" replace />
          }
        />

        {/* ADD PRODUCT (Admin only) */}
        <Route
          path="/add-product"
          element={
            isAdmin
              ? <AddProduct token={token} />
              : <Navigate to="/" replace />
          }
        />

        {/* PRODUCT DETAILS */}
        <Route
          path="/product/:id"
          element={
            token
              ? <ProductDetails token={token} />
              : <Navigate to="/login" replace />
          }
        />

        {/* New Order Route */}
        <Route
          path="/order/:id"
          element={
            token
              ? <Order token={token} />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}