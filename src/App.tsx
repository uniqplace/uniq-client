import { Routes, Route, Link } from 'react-router-dom'
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
import ProductUploadForm from './features/marketplace/components/ProductUploadForm'
import Header from './components/shared/Header'



// Placeholder component for user profile page
function UserProfile() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p className="text-gray-600">User profile page coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/uploadProduct" element={<ProductUploadForm />} />
      </Routes>
    </div>
  )
}

export default App
