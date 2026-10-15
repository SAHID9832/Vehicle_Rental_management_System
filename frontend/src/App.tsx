import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer pages
import HomePage from './pages/customer/HomePage';
import BrowseVehiclesPage from './pages/customer/BrowseVehiclesPage';
import VehicleDetailsPage from './pages/customer/VehicleDetailsPage';
import BookingPage from './pages/customer/BookingPage';
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import RentalHistoryPage from './pages/customer/RentalHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';
import AuthPage from './pages/customer/AuthPage';
import HelpPage from './pages/customer/HelpPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRentals from './pages/admin/AdminRentals';
import AdminBranches from './pages/admin/AdminBranches';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminDSALab from './pages/admin/AdminDSALab';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" /></div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="vehicles" element={<BrowseVehiclesPage />} />
        <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="booking/:vehicleId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="booking/confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
        <Route path="my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path="rental-history" element={<ProtectedRoute><RentalHistoryPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="help" element={<HelpPage />} />
        <Route path="auth" element={<AuthPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="rentals" element={<AdminRentals />} />
        <Route path="branches" element={<AdminBranches />} />
        <Route path="maintenance" element={<AdminMaintenance />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="dsa-lab" element={<AdminDSALab />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
