import React, { lazy, Suspense } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isLoggedIn } from './services/userapi/authservice';
import Chatbot from "./components/Chatbot/Chatbot";

import { UserProvider } from "./Context/UserContext";
import { CartProvider } from "./Context/CartContext";
import { WishlistProvider } from "./Context/WishlistContext";
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import MyOrders from './pages/User/Orders/MyOrders/MyOrders';
import OrderDetails from './pages/User/Orders/OrderDetails/OrderDetails';
import OrderTracking from './pages/User/Orders/OrderTracking/OrderTracking';
import './App.css';


// Axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Lazy-loaded pages
const UserLogin = lazy(() => import('./pages/UserLogin'));
const AdminLogin = lazy(() => import('./pages/admin/adminlogin'));
const AdminDashboard = lazy(() => import('./pages/admin/admindashboard'));
const EditProduct = lazy(() => import('./pages/admin/products/EditProduct'));
const ProductDetails = lazy(() => import('./pages/Product/ProductDetails/ProductDetails'));
const WishlistPage = lazy(() => import('./pages/User/Wishlist/WishlistPage'));
const ReviewPage = lazy(() => import('./pages/User/Reviews/ReviewPage'));

const ProductPages = {
  Towels: lazy(() => import('./pages/Towels')),
  Bags: lazy(() => import('./pages/Bags')),
  Napkins: lazy(() => import('./pages/Napkins')),
  Bedsheets: lazy(() => import('./pages/Bedsheets')),
  Cupcoaster: lazy(() => import('./pages/Cupcoaster')),
  Bamboo: lazy(() => import('./pages/Bamboo')),
  Paperfiles: lazy(() => import('./pages/Paperfiles')),
  CustProduct: lazy(() => import('./pages/custproduct')),
};

const workpage = {
  Block: lazy(() => import('./pages/block')),
  Tailoring: lazy(() => import('./pages/tailoring')),
  Handmade: lazy(() => import('./pages/handmade')),
  Whyvarnam: lazy(() => import('./pages/whyvarnam')),
  Bulkorders: lazy(() => import('./pages/bulkorders')),
};

const UserPages = {
  Wishlist: lazy(() => import('./pages/Wishlist')),
  LoginSignup: lazy(() => import('./pages/User/Auth/LoginSignup')),
  Profile: lazy(() => import('./pages/User/Profile/Profile')),
  Cart: lazy(() => import('./pages/User/Cart/Cart')),
  Checkout: lazy(() => import('./pages/User/Checkout/Checkout')),
  Payment: lazy(() => import('./pages/User/Checkout/PaymentPage')),
  PlaceOrder: lazy(() => import('./pages/User/Checkout/PlaceOrder'))
};

const SuperAdminPages = {
  Login: lazy(() => import('./pages/superadmin/superadminlogin')),
  Dashboard: lazy(() => import('./pages/superadmin/superadmindashboard')),
  Workers: lazy(() => import('./pages/superadmin/workers/Workers')),
  CustomerManager: lazy(() => import('./pages/superadmin/customermanager')),
  AdminRegistration: lazy(() => import('./pages/superadmin/adminregistration')),
  Admins: lazy(() => import('./pages/superadmin/admins/Admins')),
  Products: lazy(() => import('./pages/superadmin/products')),
  Units: lazy(() => import('./pages/superadmin/Units')),
  Orders: lazy(() => import('./pages/superadmin/orders/Orders')),
  OrderDetails: lazy(() => import('./pages/superadmin/orders/OrderDetails')),
  Payments: lazy(() => import('./pages/superadmin/payments/payments')),
  Reviews: lazy(() => import('./pages/superadmin/reviews/reviews')),
  SalesReports: lazy(() => import('./pages/superadmin/sales/SalesReports')),
  Stores: lazy(() => import('./pages/superadmin/stores/Stores')),
  Users: lazy(() => import('./pages/superadmin/users/Users')),
  Analytics: lazy(() => import('./pages/superadmin/analytics/Analytics')),
};

const CheckoutPages = {
  CustomDesignPage: lazy(() => import('./pages/CustomDesignPage')),
  UploadDesignAndCheckout: lazy(() => import('./pages/UploadDesignAndCheckout')),
};

const CustomizerPages = {
  TowelCustomize: lazy(() => import('./components/Customizer/Customizer')),
  BagCustomize: lazy(() => import('./components/Bags/Bags')),
  PaperFileCustomize: lazy(() => import('./components/PaperFileCustomizer/PaperFileCustomizer')),
  NapkinCustomize: lazy(() => import('./components/NapkinCustomize/NapkinCustomize')),
  BedsheetCustomize: lazy(() => import('./components/BedSheets/BedSheets')),
  CupCoasterCustomize: lazy(() => import('./components/CupCoaster/CupCoaster')),
  CustomizationGeneral: lazy(() => import('./components/Customization/Customization')),
};

const InfoPages = {
  AboutPage: lazy(() => import('./pages/AboutPage')),
  ContactUs: lazy(() => import('./pages/ContactUs')),
  Gallery: lazy(() => import('./pages/Gallery')),
  Vaagai: lazy(() => import('./pages/vaagai')),
  Varnam: lazy(() => import('./pages/varnam')),
  Siragugal: lazy(() => import('./pages/siragugal')),
};

const LoadingFallback = () => <div className="loading">Loading...</div>;

const MainLayout = ({ children }) => (
  <div className="app-container">
    <Header />
    <main className="main-content">
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
);

const StandalonePage = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/loginsignup" />;
  }
  return children;
};

const App = () => {
  
const createRoutes = (components, pathPrefix = '') => {
  return Object.entries(components).map(([name, Component]) => (
    <Route
      key={`${pathPrefix}/${name.toLowerCase()}`}
      path={`${pathPrefix}/${name.toLowerCase()}`}
      element={<MainLayout><Component /></MainLayout>}
    />
  ));
};

  return (
    <UserProvider>
      <Router>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Standalone Routes */}
              <Route path="/loginsignup" element={<StandalonePage><UserPages.LoginSignup /></StandalonePage>} />
              <Route path="/UserLogin" element={<StandalonePage><UserLogin /></StandalonePage>} />
              <Route path="/admin/login" element={<StandalonePage><AdminLogin /></StandalonePage>} />
              <Route path="/superadmin/login" element={<StandalonePage><SuperAdminPages.Login /></StandalonePage>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<StandalonePage><AdminDashboard /></StandalonePage>} />
              <Route path="/admin/products/edit/:id" element={<StandalonePage><EditProduct /></StandalonePage>} />

              {/* Superadmin Routes */}
              <Route path="/superadmin/dashboard" element={<StandalonePage><SuperAdminPages.Dashboard /></StandalonePage>} />

              {/* Home */}
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/ProductPage" element={<MainLayout><ProductPage /></MainLayout>} />

              {/* Protected Cart/Checkout */}
              <Route path="/cart" element={<ProtectedRoute><MainLayout><UserPages.Cart /></MainLayout></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><MainLayout><UserPages.Checkout /></MainLayout></ProtectedRoute>} />
              <Route path="/checkout/payment" element={<ProtectedRoute><MainLayout><UserPages.Payment /></MainLayout></ProtectedRoute>} />
              <Route path="/checkout/placeorder" element={<ProtectedRoute><MainLayout><UserPages.PlaceOrder /></MainLayout></ProtectedRoute>} />

              {/* Wishlist */}
              <Route path="/wishlist" element={<ProtectedRoute><MainLayout><Suspense fallback={<LoadingFallback />}><WishlistPage /></Suspense></MainLayout></ProtectedRoute>} />

              {/* Product Details */}
              <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />

              {/* Orders */}
              <Route path="/orders" element={<ProtectedRoute><MainLayout><MyOrders /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><MainLayout><OrderDetails /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/:orderId/track" element={<ProtectedRoute><MainLayout><OrderTracking /></MainLayout></ProtectedRoute>} />

              {/* Reviews */}
              <Route path="/review/:productId" element={<ProtectedRoute><MainLayout><ReviewPage /></MainLayout></ProtectedRoute>} />

              {/* Specialized Customizers */}
              <Route path="/customize/towel" element={<MainLayout><CustomizerPages.TowelCustomize /></MainLayout>} />
              <Route path="/customize/bag" element={<MainLayout><CustomizerPages.BagCustomize /></MainLayout>} />
              <Route path="/customize/paperfile" element={<MainLayout><CustomizerPages.PaperFileCustomize /></MainLayout>} />
              <Route path="/customize/napkin" element={<MainLayout><CustomizerPages.NapkinCustomize /></MainLayout>} />
              <Route path="/customize/bedsheet" element={<MainLayout><CustomizerPages.BedsheetCustomize /></MainLayout>} />
              <Route path="/customize/cupcoaster" element={<MainLayout><CustomizerPages.CupCoasterCustomize /></MainLayout>} />
              <Route path="/customize/general" element={<MainLayout><CustomizerPages.CustomizationGeneral /></MainLayout>} />

              {/* Browse and Upload Design routes */}
              <Route path="/browse-design" element={<MainLayout><CheckoutPages.CustomDesignPage /></MainLayout>} />
              <Route path="/upload-design" element={<MainLayout><CheckoutPages.UploadDesignAndCheckout /></MainLayout>} />

              {/* Generated Routes */}
              {createRoutes(UserPages, '')}
              {createRoutes(ProductPages, '')}
              {createRoutes(workpage, '')}
              {createRoutes(CheckoutPages, '')}
              {createRoutes(InfoPages, '')}

              {/* Superadmin extras */}
              <Route path="/superadmin/workers" element={<StandalonePage><SuperAdminPages.Workers /></StandalonePage>} />
              <Route path="/superadmin/customers" element={<StandalonePage><SuperAdminPages.CustomerManager /></StandalonePage>} />
              <Route path="/superadmin/admins" element={<StandalonePage><SuperAdminPages.Admins /></StandalonePage>} />
              <Route path="/superadmin/products" element={<StandalonePage><SuperAdminPages.Products /></StandalonePage>} />
              <Route path="/superadmin/orders" element={<StandalonePage><SuperAdminPages.Orders /></StandalonePage>} />
              <Route path="/superadmin/orders/:orderId" element={<StandalonePage><SuperAdminPages.OrderDetails /></StandalonePage>} />
              <Route path="/superadmin/payments" element={<StandalonePage><SuperAdminPages.Payments /></StandalonePage>} />
              <Route path="/superadmin/reviews" element={<StandalonePage><SuperAdminPages.Reviews /></StandalonePage>} />
              <Route path="/superadmin/sales" element={<StandalonePage><SuperAdminPages.SalesReports /></StandalonePage>} />
              <Route path="/superadmin/stores" element={<StandalonePage><SuperAdminPages.Stores /></StandalonePage>} />
              <Route path="/superadmin/users" element={<StandalonePage><SuperAdminPages.Users /></StandalonePage>} />
              <Route path="/superadmin/analytics" element={<StandalonePage><SuperAdminPages.Analytics /></StandalonePage>} />
              <Route path="/superadmin/units" element={<StandalonePage><SuperAdminPages.Units /></StandalonePage>} />
              <Route path="/superadmin/adminregistration" element={<StandalonePage><SuperAdminPages.AdminRegistration /></StandalonePage>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            {/* Chatbot stays fixed on every page */}
            <Chatbot />
          </WishlistProvider>
        </CartProvider>
      </Router>
      <ToastContainer />
    </UserProvider>
  );
};

export default App;
