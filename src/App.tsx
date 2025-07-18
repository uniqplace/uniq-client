import { Routes, Route, Link } from 'react-router-dom'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './features/marketplace/slices/userSlice';
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import './App.css'
import Marketplace from './pages/Marketplace'
import Orders from './pages/Orders'
import ProductPage from './pages/ProductPage'
import Register from './pages/Register'
import Login from './pages/Login'
import About from './pages/About'
import Home from './pages/Home'
import CreatorProductPage from './pages/CreatorProductPage';


function UserProfile() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p className="text-gray-600">User profile page coming soon...</p>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setUser(user));
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
  }, [dispatch]);

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
          <Link to="/creatorProductPage" className="text-blue-600 hover:text-blue-800">creatorProductPage</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/creatorProductPage" element={<CreatorProductPage />} />
      </Routes>
    </div>
  );
}

export default App;
