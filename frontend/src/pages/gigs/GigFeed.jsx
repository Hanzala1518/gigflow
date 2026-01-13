import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchGigs } from '../../store/slices/gigSlice';
import Spinner from '../../components/common/Spinner';
import GigCard from '../../components/gigs/GigCard';
import CreateGigModal from '../../components/gigs/CreateGigModal';

export default function GigFeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const dispatch = useDispatch();
  const { gigs, isLoading } = useSelector((state) => state.gigs);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch gigs when search changes
  useEffect(() => {
    dispatch(fetchGigs(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Available Gigs</h1>
          <p className="text-slate-600 mt-2">Find your next project opportunity</p>
        </div>

        {isAuthenticated && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Gig
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search gigs by title..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Gigs Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-200">
          <svg
            className="mx-auto h-16 w-16 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No gigs found</h3>
          <p className="mt-2 text-slate-500">
            {searchTerm ? 'Try a different search term' : 'Be the first to post a gig!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <Link key={gig._id} to={`/gigs/${gig._id}`}>
              <GigCard gig={gig} />
            </Link>
          ))}
        </div>
      )}

      {/* Create Gig Modal */}
      {showCreateModal && <CreateGigModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
