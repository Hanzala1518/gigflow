import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyGigs } from '../../store/slices/gigSlice';
import { fetchMyBids, fetchBidsForGig } from '../../store/slices/bidSlice';
import Spinner from '../../components/common/Spinner';
import CreateGigModal from '../../components/gigs/CreateGigModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('gigs');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [receivedBids, setReceivedBids] = useState([]);
  const [isLoadingReceivedBids, setIsLoadingReceivedBids] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myGigs, isLoadingMyGigs } = useSelector((state) => state.gigs);
  const { myBids, isLoading: bidsLoading } = useSelector((state) => state.bids);

  // Track if we've already fetched received bids to prevent duplicate requests
  const hasFetchedReceivedBids = useRef(false);
  const lastMyGigsIds = useRef('');

  useEffect(() => {
    dispatch(fetchMyGigs());
    dispatch(fetchMyBids());
  }, [dispatch]);

  // Fetch all bids for user's gigs when gigs are loaded
  useEffect(() => {
    // Create a stable identifier for current myGigs
    const currentMyGigsIds = myGigs.map(g => g._id).sort().join(',');
    
    // Skip if same gigs or already loading
    if (currentMyGigsIds === lastMyGigsIds.current && hasFetchedReceivedBids.current) {
      return;
    }

    const fetchAllReceivedBids = async () => {
      if (myGigs.length > 0) {
        setIsLoadingReceivedBids(true);
        hasFetchedReceivedBids.current = true;
        lastMyGigsIds.current = currentMyGigsIds;
        
        try {
          const allBidsPromises = myGigs.map(gig => 
            dispatch(fetchBidsForGig(gig._id)).unwrap()
          );
          const allBidsArrays = await Promise.all(allBidsPromises);
          
          // Flatten and combine all bids with their gig info
          const combinedBids = allBidsArrays.flatMap((bids, index) => 
            bids.map(bid => ({
              ...bid,
              gigInfo: myGigs[index]
            }))
          );
          
          setReceivedBids(combinedBids);
        } catch (error) {
          console.error('Error fetching received bids:', error);
        } finally {
          setIsLoadingReceivedBids(false);
        }
      } else {
        setReceivedBids([]);
        lastMyGigsIds.current = '';
      }
    };

    if (!isLoadingMyGigs) {
      fetchAllReceivedBids();
    }
  }, [myGigs, isLoadingMyGigs, dispatch]);

  const tabs = [
    { id: 'gigs', label: 'My Gigs', count: myGigs.length },
    { id: 'bids', label: 'My Bids', count: myBids.length },
    { id: 'received', label: 'Bids Received', count: receivedBids.length },
  ];

  const statusColors = {
    pending: 'badge-pending',
    hired: 'badge-hired',
    rejected: 'badge-rejected',
    open: 'badge-open',
    assigned: 'badge-assigned',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back, {user?.name}! 👋</p>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-slate-200 mb-8">
        <nav className="-mb-0.5 flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* My Gigs Tab */}
      {activeTab === 'gigs' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Gigs You Posted</h2>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Gig
            </button>
          </div>

          {isLoadingMyGigs ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : myGigs.length === 0 ? (
            <div className="text-center py-16 card border-2 border-dashed border-slate-200">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No gigs posted yet</h3>
              <p className="mt-2 text-slate-500">Get started by posting your first gig.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
                Post a Gig
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myGigs.map((gig) => (
                <Link key={gig._id} to={`/app/gigs/${gig._id}`}>
                  <div className="card p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {gig.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          Budget: <span className="text-blue-600 font-bold">₹{gig.budget}</span>
                        </p>
                      </div>
                      <span className={statusColors[gig.status]}>
                        {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bids Tab */}
      {activeTab === 'bids' && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Bids You Placed</h2>

          {bidsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : myBids.length === 0 ? (
            <div className="text-center py-16 card border-2 border-dashed border-slate-200">
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No bids placed yet</h3>
              <p className="mt-2 text-slate-500">Browse gigs and start bidding!</p>
              <Link to="/app/gigs" className="btn-primary mt-4 inline-block">
                Browse Gigs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myBids.map((bid) => (
                <Link key={bid._id} to={`/app/gigs/${bid.gigId?._id}`}>
                  <div className="card p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-blue-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gig:</span>
                          <h3 className="text-lg font-bold text-slate-900 truncate">
                            {bid.gigId?.title || 'Unknown Gig'}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                          {bid.gigId?.description || 'No description available'}
                        </p>
                        <div className="text-xs text-slate-500 mb-3">
                          Posted by <span className="font-medium text-slate-700">{bid.gigId?.ownerId?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <span className={statusColors[bid.status]}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Your Bid Message:</p>
                      <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">{bid.message}</p>
                    </div>

                    {/* Show rejection reason if rejected */}
                    {bid.status === 'rejected' && bid.rejectionReason && (
                      <div className="bg-red-50 rounded-lg p-3 mb-3 border border-red-200">
                        <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-600 line-clamp-2 leading-relaxed">{bid.rejectionReason}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
                      <div>
                        <span className="text-sm text-slate-500">Your bid: </span>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">₹{bid.price}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        <span>Gig budget: </span>
                        <span className="font-semibold text-slate-700">₹{bid.gigId?.budget}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bids Received Tab */}
      {activeTab === 'received' && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Bids Received on Your Gigs</h2>

          {isLoadingReceivedBids ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : receivedBids.length === 0 ? (
            <div className="text-center py-16 card border-2 border-dashed border-slate-200">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No bids received yet</h3>
              <p className="mt-2 text-slate-500">
                {myGigs.length === 0
                  ? 'Post a gig to start receiving bids from freelancers.'
                  : 'Freelancers will submit bids on your posted gigs soon.'}
              </p>
              {myGigs.length === 0 && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
                  Post a Gig
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {receivedBids.map((bid) => (
                <Link key={bid._id} to={`/app/gigs/${bid.gigId}`}>
                  <div className="card p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-blue-500/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">On:</span>
                          <span className="text-sm font-bold text-slate-900 truncate">{bid.gigInfo?.title}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {bid.freelancerId?.name || 'Unknown Freelancer'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{bid.freelancerId?.email}</p>
                      </div>
                      <span className={statusColors[bid.status]}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-slate-700 mb-3 line-clamp-2 leading-relaxed">{bid.message}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
                      <div>
                        <span className="text-sm text-slate-500">Bid amount: </span>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">₹{bid.price}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        <span>Gig budget: </span>
                        <span className="font-semibold text-slate-700">₹{bid.gigInfo?.budget}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Gig Modal */}
      {showCreateModal && <CreateGigModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
