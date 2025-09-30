import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Rating } from 'primereact/rating';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './features/marketplace/thunks/userThunk';
import { store, type AppDispatch, type RootState } from './store';
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
import BidOfferDetails from './features/deployProcess/components/BidOfferDetails';
import { PrivateRoute } from './utils/PrivateRoute';
// import ThreadsPage from './features/chat/pages/ThreadsPage';
import ChatPage from './features/chat/pages/ChatPage';
import { initChatSocketBridge } from './features/chat/socketBridge';
// import { Thread } from 'stream-chat';
import ThreadsStream from './features/chat/pages/ThreadsStream';

import CreatorProfilePage from './features/user/components/CreatorProfilePage';
import ManufacturerProfilePage from './features/user/components/ManufacturerProfilePage';




function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // דוגמה: שליפת פרופיל מהשרת (להחליף ב-API שלך)
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">טוען פרופיל...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">לא נמצא פרופיל למשתמש {id}</div>;

  return (
    <div className="p-4 flex justify-center">
      <Card title="פרופיל משתמש" className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            image={profile.avatarUrl}
            label={(!profile.avatarUrl && (profile.name?.[0] || profile.email?.[0] || '?').toUpperCase()) || undefined}
            size="xlarge"
            shape="circle"
            className="mb-3"
          />
          <div className="font-semibold text-lg">{profile.name || profile.email || profile.id}</div>
          <div className="text-gray-500">{profile.email}</div>
          {profile.role && (
            <Badge value={profile.role} className="bg-blue-100 text-blue-800" style={{ direction: 'rtl' }}></Badge>
          )}
          {typeof profile.rating === 'number' && (
            <div className="flex items-center gap-2">
              <span>דירוג:</span>
              <Rating value={profile.rating} readOnly cancel={false} stars={5} />
              <span className="text-yellow-600">({profile.rating})</span>
            </div>
          )}
          {Array.isArray(profile.followers) && (
            <div className="flex items-center gap-2">
              <span>עוקבים:</span>
              <Badge value={profile.followers.length} severity="info" />
            </div>
          )}
        </div>
      </Card>
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
  
  useEffect(() => {
    const unsubscribe = initChatSocketBridge();

    return unsubscribe;

  }, [store]);
  
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
          <Route
            path="/myBidRequests/:bidRequestId"
            element={
              <PrivateRoute>
                <BidRequestDetails />
              </PrivateRoute>
            }
          />
          <Route path="/MyBidRequest" element={<BidRequestsTabs />} />
          <Route path="/myBidRequestsNotifications" element={<MyBidRequestsNotifications />} />
          <Route path="/myBidRequests" element={<ManufacturerBidRequests />} />
          <Route path="/BidOffer" element={<BidOfferForm />} />
          <Route path="/MyBidRequest/:bidRequestId" element={<OpenBidPage />} />
          <Route path="/MyBidRequest" element={<OpenBidPage />} />
          <Route
            path="/BidOfferDetails/:BidOfferId"
            element={
              <PrivateRoute>
                <BidOfferDetails />
              </PrivateRoute>
            }
          />

            <Route path="/chat" element={<ThreadsStream />} />

            <Route path="/chat/:cid" element={<ChatPage />} />
          
          <Route path='/creator/:creatorId' element={<CreatorProfilePage />} />
          <Route path='/manufacturer/:manufacturerId' element={<ManufacturerProfilePage />} />
          <Route path='/customer/:userId' element={<div><i className="pi pi-user" style={{ marginRight: '8px' }}></i>Customer Profile coming soon...</div>} />
          <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
        </Routes>
      </MainContent>
    </div>
  );
}

export default App;
