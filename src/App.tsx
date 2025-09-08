import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/marketplace/thunks/userThunk';
import type { AppDispatch, RootState } from './store';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import './index.css';
import Marketplace from './pages/Marketplace';
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
import { CheckoutPage } from './features/order/components/Checkout/CheckoutPage';
import BidRequestsTabs from './features/deployProcess/components/BidRequestsTabs';
import MyBidRequestsNotifications from './pages/MyBidRequestsNotifications';
import CreateYourOwnProduct from './pages/CreateYourOwnProduct';
import BidOfferForm from './features/deployProcess/components/BidOfferForm';
import BidRequestDetails from './features/deployProcess/components/BidRequestDetails';
import ManufacturerBidRequests from './features/deployProcess/components/ManufacturerBidRequests';
import MyOrdersWrapper from './features/order/components/Orders/MyOrdersWrapper';
import { OpenBidPage } from './features/deployProcess/components/OpenBidPage';
import { socket_events } from './constants/socketEvents';
import { getSocket } from './services/socket';
import PrivateRoute from './utils/PrivateRoute';
import BidOfferDetails from './features/deployProcess/components/BidOfferDetails';




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
  const loading = useSelector((state: RootState) => state.user.loading);
  const [wasLoading, setWasLoading] = useState(false);


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





  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NewHeader />
      <ToastContainer position="top-right" autoClose={5000} style={{ marginTop: '56px' }} />
      <MainContent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/account/orders" element={<MyOrdersWrapper />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/uploadProduct" element={<ProductUploadForm />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/CreatorProductPage" element={<CreatorProductPage />} />
          <Route path="/create-your-own-product/*" element={<CreateYourOwnProduct />} />
          <Route path="/checkout/:productId" element={<CheckoutPage />} />
          <Route path="/MyBidRequest" element={<BidRequestsTabs />} />
          <Route path="/myBidRequestsNotifications" element={<MyBidRequestsNotifications />} />
          <Route path="/myBidRequests" element={<ManufacturerBidRequests />} />
          <Route path="/myBidRequests/:bidRequestId" element={<BidRequestDetails />} />
          <Route path="/BidOffer" element={<BidOfferForm />} />
          <Route path="/MyBidRequest/:bidRequestId" element={<OpenBidPage />} />
          <Route path="/MyBidRequest" element={<OpenBidPage />} />
          {/* <Route path="/BidOfferDetails/:BidOfferId" element={<BidOfferDetails />} /> */}
          <Route
            path="/BidOfferDetails/:BidOfferId"
            element={
              <PrivateRoute>
                <BidOfferDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </MainContent>
      {/* <h5>Socket.IO + React Toastify</h5> */}

      {/* <button
        onClick={() =>
          sendSocket()
        }
      >
        Simulate New Bid For User {user.name}
      </button> */}
    </div>
  );
}

export default App;
