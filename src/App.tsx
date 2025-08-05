import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSocketListeners from './hooks/useSocketListeners';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/marketplace/thunks/userThunk';
import type { AppDispatch, RootState } from './store';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import './index.css';
import Marketplace from './pages/Marketplace';
import Orders from './pages/Orders';
import ProductPage from './pages/ProductPage';
import Register from './pages/Register';
import Login from './pages/Login';
import About from './pages/About';
import Home from './pages/Home';
import ProductUploadForm from './features/marketplace/components/ProductUploadForm';
import NewHeader from './components/shared/NewHeader';
import MainContent from './components/shared/MainContent';
import './styles/sidebar.css';
import ProfilePage from './features/user/components/ProfilePage';
import CreatorProductPage from './pages/CreatorProductPage';
import { CheckoutPage } from './features/order/components/CheckoutPage';
import { OpenBidPage } from './features/deployProcess/components/OpenBidPage';
import CreateYourOwnProduct from './pages/CreateYourOwnProduct';
import socket from './services/socket';
import { toast } from 'react-toastify';
import { ProgressSpinner } from 'primereact/progressspinner';
import BidOfferForm from './features/deployProcess/components/BidOfferForm';



function UserProfile() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p className="text-gray-600">User profile page coming soon...</p>
    </div>
  );
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);
  const loading = user.loading;
  const [wasLoading, setWasLoading] = useState(false);
  useSocketListeners({ userId: user?.id ?? undefined, role: user?.role ?? undefined });

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (loading) setWasLoading(true);
  }, [loading]);

  useEffect(() => {
    if (
      wasLoading &&
      !loading &&
      (!user?.id || !user?.email) &&
      location.pathname !== '/login' &&
      location.pathname !== '/register'
    ) {
      navigate('/login');
    }
  }, [user?.id, user?.email, loading, wasLoading, navigate, location.pathname]);

  useEffect(() => {
  }, [user]);

  useEffect(() => {
    const handleBidSentConfirmation = (data: any) => {
      console.log('Bid sent confirmation:', data);
      if (data.error) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    };
    socket.on('bid_sent_confirmation', handleBidSentConfirmation);

    return () => {
      socket.off('bid_sent_confirmation', handleBidSentConfirmation);
    };
  }, []);

  //if (loading) {
  //  return <div>Loading...</div>;
  // }
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ProgressSpinner />
        <span style={{ marginTop: '1rem' }}>Loading...</span>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NewHeader />
      <ToastContainer position="top-right" autoClose={5000} style={{ marginTop: '56px' }} />
      <MainContent>
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/CreatorProductPage" element={<CreatorProductPage />} />
          <Route path="/create-your-own-product/*" element={<CreateYourOwnProduct />} />
          <Route path="/checkout/:productId" element={<CheckoutPage />} />
          <Route path="/BidOffer" element={<BidOfferForm bidRequestId="6885e9e91a27cccc0165de40" manufacturerId="687f7b71c3ffd771d479aa5c" />} />
          <Route path="/MyBidRequest/:bidRequestId" element={<OpenBidPage />} />
          <Route path="/MyBidRequest" element={<OpenBidPage />} />
        </Routes>
      </MainContent>
      <h5>Socket.IO + React Toastify</h5>



      <button
        onClick={() => {
          fetch(`http://localhost:5002/api/test-bid/6885d9317e124ee3aaebfafe/${user.id}`);///api/test-bid/:userId/:senderUserId
        }}
      >
        Simulate New Bid For User {user.name}
      </button>


    </div>
  );
}

export default App;
