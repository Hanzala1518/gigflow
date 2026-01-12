import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById, clearCurrentGig, updateGigStatus } from '../../store/slices/gigSlice';
import { fetchBidsForGig, createBid, hireBid, clearGigBids } from '../../store/slices/bidSlice';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import BidCard from '../../components/bids/BidCard';
import PlaceBidModal from '../../components/bids/PlaceBidModal';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showBidModal, setShowBidModal] = useState(false);

  const { currentGig, isLoading: gigLoading } = useSelector((state) => state.gigs);
  const { gigBids, isLoading: bidsLoading, isHiring } = useSelector((state) => state.bids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Compare using string conversion to handle ObjectId comparison
  const isOwner = isAuthenticated && user && currentGig?.ownerId?._id && 
    String(currentGig.ownerId._id) === String(user.id);
  const isAssigned = currentGig?.status === 'assigned';

  useEffect(() => {
    dispatch(fetchGigById(id));

    return () => {
      dispatch(clearCurrentGig());
      dispatch(clearGigBids());
    };
  }, [id, dispatch]);

  // Fetch bids if user is the owner
  useEffect(() => {
    // Only fetch bids if we're sure the user is the owner
    // Double-check authentication and ownership before making the API call
    if (isAuthenticated && user && currentGig && currentGig.ownerId?._id &&
        String(currentGig.ownerId._id) === String(user.id)) {
      dispatch(fetchBidsForGig(id));
    }
  }, [isAuthenticated, user, currentGig, id, dispatch]);

  const handleHire = async (bidId) => {
    const result = await dispatch(hireBid(bidId));
    if (hireBid.fulfilled.match(result)) {
      toast.success('Freelancer hired successfully!');
      dispatch(updateGigStatus({ gigId: id, status: 'assigned' }));
    } else {
      toast.error(result.payload || 'Failed to hire');
    }
  };

  const handlePlaceBid = async (bidData) => {
    const result = await dispatch(createBid({ ...bidData, gigId: id }));
    if (createBid.fulfilled.match(result)) {
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
    } else {
      toast.error(result.payload || 'Failed to place bid');
    }
  };

  if (gigLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Gig not found</h2>
        <button onClick={() => navigate('/gigs')} className="btn-primary mt-4">
          Back to Gigs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/gigs')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Gigs
      </button>

      {/* Gig Details */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentGig.title}</h1>
            <p className="text-gray-500 mt-1">
              Posted by {currentGig.ownerId?.name || 'Unknown'}
            </p>
          </div>
          <span className={`badge-${currentGig.status}`}>
            {currentGig.status.charAt(0).toUpperCase() + currentGig.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap mb-6">{currentGig.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-2xl font-bold text-primary-600">${currentGig.budget}</div>

          {isAuthenticated && !isOwner && !isAssigned && (
            <button onClick={() => setShowBidModal(true)} className="btn-primary">
              Place a Bid
            </button>
          )}
        </div>
      </div>

      {/* Bids Section (Owner Only) */}
      {isOwner && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bids ({gigBids.length})
          </h2>

          {bidsLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : gigBids.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No bids yet</p>
          ) : (
            <div className="space-y-4">
              {gigBids.map((bid) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  isOwner={true}
                  isAssigned={isAssigned}
                  isHiring={isHiring}
                  onHire={() => handleHire(bid._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Place Bid Modal */}
      {showBidModal && (
        <PlaceBidModal
          gig={currentGig}
          onClose={() => setShowBidModal(false)}
          onSubmit={handlePlaceBid}
        />
      )}
    </div>
  );
}
