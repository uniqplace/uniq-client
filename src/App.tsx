
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import 'primeflex/primeflex.css';
import './App.css';
import Marketplace from './pages/Marketplace';
import Orders from './pages/Orders';
import Register from './pages/Register';
import Login from './pages/Login';
import About from './pages/About';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';


function App() {
  return (
    <div>
      <nav className="p-4 bg-gray-100">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          <Link to="/marketplace" className="text-blue-600 hover:text-blue-800">Marketplace</Link>
          <Link to="/orders" className="text-blue-600 hover:text-blue-800">Orders</Link>
          <Link to="/about" className="text-blue-600 hover:text-blue-800">About</Link>
          <Link to="/register" className="text-blue-600 hover:text-blue-800">Register</Link>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App
