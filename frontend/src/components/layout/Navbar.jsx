import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, resetAuthState } from '../../store/slices/authSlice';
import { resetGigState } from '../../store/slices/gigSlice';
import { resetBidState } from '../../store/slices/bidSlice';
import toast from 'react-hot-toast';
import { disconnectSocket } from '../../services';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await dispatch(logout());
    disconnectSocket();
    localStorage.removeItem('gigflow_token');
    dispatch(resetAuthState());
    dispatch(resetGigState());
    dispatch(resetBidState());
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/app" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-base font-bold">G</span>
              </div>
              <span className="text-lg font-semibold text-slate-800">GigFlow</span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/app/gigs"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 ${
                isActive('/app/gigs')
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Browse Gigs
            </Link>
            {isAuthenticated && (
              <Link
                to="/app/dashboard"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 ${
                  isActive('/app/dashboard')
                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    Hi, <span className="font-medium text-slate-800">{user?.name}</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-600">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-150"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-150"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
