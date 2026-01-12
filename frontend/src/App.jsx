import { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { checkAuth } from './store/slices/authSlice';
import { 
  initializeSocket, 
  disconnectSocket, 
  subscribeToEvent, 
  unsubscribeFromEvent 
} from './services';

// Layout
import { Layout } from './components/layout';

// Pages
import { Login, Register } from './pages/auth';
import { GigFeed, GigDetail } from './pages/gigs';
import { Dashboard } from './pages/dashboard';

// Components
import { ProtectedRoute } from './components/common';

function App() {
  const dispatch = useDispatch();
  const { isCheckingAuth, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Handle hired notification
  const handleHiredNotification = useCallback((data) => {
    toast.success(data.message, {
      duration: 6000,
      icon: '🎉',
      style: {
        background: '#059669',
        color: '#fff',
      },
    });
  }, []);

  // Socket.io connection management
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection when authenticated
      initializeSocket();
      
      // Subscribe to hired events
      subscribeToEvent('hired', handleHiredNotification);

      return () => {
        unsubscribeFromEvent('hired', handleHiredNotification);
      };
    } else {
      // Disconnect socket when logged out
      disconnectSocket();
    }
  }, [isAuthenticated, handleHiredNotification]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
      <Routes>
        {/* Auth Routes (No Layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Layout Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            isAuthenticated ? <Navigate to="/gigs" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="gigs" element={<GigFeed />} />
          <Route path="gigs/:id" element={<GigDetail />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/gigs" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
