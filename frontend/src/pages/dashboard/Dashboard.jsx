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

  const hasFetchedReceivedBids = useRef(false);
  const lastMyGigsIds = useRef('');

  useEffect(() => {
    dispatch(fetchMyGigs());
    dispatch(fetchMyBids());
  }, [dispatch]);

  useEffect(() => {
    const currentMyGigsIds = myGigs.map(g => g._id).sort().join(',');
    
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* My Gigs Tab */}
      {activeTab === 'gigs' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-800">Gigs You Posted</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Gig
            </button>
          </div>

          {isLoadingMyGigs ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : myGigs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-900">No gigs posted yet</h3>
              <p className="mt-1 text-sm text-slate-500">Get started by posting your first gig.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-150"
              >
                Post a Gig
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {myGigs.map((gig, index) => (
                <Link key={gig._id} to={`/app/gigs/${gig._id}`} className="block">
                  <div className={`px-5 py-4 hover:bg-slate-50 transition-colors duration-150 ${index !== 0 ? 'border-t border-slate-100' : ''}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-slate-900">{gig.title}</h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                          Budget: <span className="font-medium text-blue-600">${gig.budget}</span>
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
          <h2 className="text-base font-semibold text-slate-800 mb-6">Bids You Placed</h2>

          {bidsLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : myBids.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-900">No bids placed yet</h3>
              <p className="mt-1 text-sm text-slate-500">Browse gigs and start bidding!</p>
              <Link
                to="/app/gigs"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-150"
              >
                Browse Gigs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myBids.map((bid) => (
                <Link key={bid._id} to={`/app/gigs/${bid.gigId?._id}`} className="block">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-150">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Gig</p>
                        <h3 className="text-sm font-medium text-slate-900">
                          {bid.gigId?.title || 'Unknown Gig'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {bid.gigId?.description || 'No description available'}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Posted by {bid.gigId?.ownerId?.name || 'Unknown'}
                        </p>
                      </div>
                      <span className={statusColors[bid.status]}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-slate-500 mb-1">Your Bid Message</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{bid.message}</p>
                    </div>

                    {bid.status === 'rejected' && bid.rejectionReason && (
                      <div className="bg-red-50 rounded-lg p-3 mb-3 border border-red-100">
                        <p className="text-xs text-red-600 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-700 line-clamp-2">{bid.rejectionReason}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-sm">
                        <span className="text-slate-500">Your bid: </span>
                        <span className="font-semibold text-blue-600">${bid.price}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Budget: <span className="font-medium text-slate-700">${bid.gigId?.budget}</span>
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
          <h2 className="text-base font-semibold text-slate-800 mb-6">Bids Received on Your Gigs</h2>

          {isLoadingReceivedBids ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : receivedBids.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-900">No bids received yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                {myGigs.length === 0
                  ? 'Post a gig to start receiving bids from freelancers.'
                  : 'Freelancers will submit bids on your posted gigs soon.'}
              </p>
              {myGigs.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-150"
                >
                  Post a Gig
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {receivedBids.map((bid) => (
                <Link key={bid._id} to={`/app/gigs/${bid.gigId}`} className="block">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-150">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                          On: {bid.gigInfo?.title}
                        </p>
                        <h3 className="text-sm font-medium text-slate-900">
                          {bid.freelancerId?.name || 'Unknown Freelancer'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{bid.freelancerId?.email}</p>
                      </div>
                      <span className={statusColors[bid.status]}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{bid.message}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-sm">
                        <span className="text-slate-500">Bid: </span>
                        <span className="font-semibold text-blue-600">${bid.price}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        Budget: <span className="font-medium text-slate-700">${bid.gigInfo?.budget}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && <CreateGigModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
