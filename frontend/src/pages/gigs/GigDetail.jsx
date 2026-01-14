import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById, clearCurrentGig, updateGigStatus } from '../../store/slices/gigSlice';
import { fetchBidsForGig, createBid, hireBid, rejectBid, clearGigBids } from '../../store/slices/bidSlice';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import BidCard from '../../components/bids/BidCard';
import PlaceBidModal from '../../components/bids/PlaceBidModal';
import RejectBidModal from '../../components/bids/RejectBidModal';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showBidModal, setShowBidModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBidForReject, setSelectedBidForReject] = useState(null);

  const { currentGig, isLoading: gigLoading } = useSelector((state) => state.gigs);
  const { gigBids, isLoading: bidsLoading, isHiring, isRejecting } = useSelector((state) => state.bids);
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

  const handleOpenRejectModal = (bid) => {
    setSelectedBidForReject(bid);
    setShowRejectModal(true);
  };

  const handleReject = async (rejectionReason) => {
    if (!selectedBidForReject) return;

    const result = await dispatch(rejectBid({ 
      bidId: selectedBidForReject._id, 
      rejectionReason 
    }));
    
    if (rejectBid.fulfilled.match(result)) {
      toast.success('Bid rejected successfully');
      setShowRejectModal(false);
      setSelectedBidForReject(null);
    } else {
      toast.error(result.payload || 'Failed to reject bid');
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
        <button onClick={() => navigate('/app/gigs')} className="btn-primary mt-4">
          Back to Gigs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/gigs')}
        className="flex items-center text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors group"
      >
        <svg className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Gigs
      </button>

      {/* Gig Details */}
      <div className="card p-8 mb-6 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{currentGig.title}</h1>
            <p className="text-slate-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Posted by {currentGig.ownerId?.name || 'Unknown'}
            </p>
          </div>
          <span className={`badge-${currentGig.status}`}>
            {currentGig.status.charAt(0).toUpperCase() + currentGig.status.slice(1)}
          </span>
        </div>

        <p className="text-slate-700 whitespace-pre-wrap mb-6 leading-relaxed">{currentGig.description}</p>

        <div className="flex items-center justify-between pt-6 border-t-2 border-slate-100">
          <div>
            <p className="text-sm text-slate-500 mb-1">Budget</p>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">₹{currentGig.budget}</div>
          </div>

          {isAuthenticated && !isOwner && !isAssigned && (
            <button onClick={() => setShowBidModal(true)} className="btn-primary">
              Place a Bid
            </button>
          )}
        </div>
      </div>

      {/* Bids Section (Owner Only) */}
      {isOwner && (
        <div className="card p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Bids ({gigBids.length})
          </h2>

          {bidsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : gigBids.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">No bids yet</p>
              <p className="text-sm text-slate-400 mt-1">Waiting for freelancers to submit proposals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gigBids.map((bid) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  isOwner={true}
                  isAssigned={isAssigned}
                  isHiring={isHiring}
                  isRejecting={isRejecting}
                  onHire={() => handleHire(bid._id)}
                  onReject={() => handleOpenRejectModal(bid)}
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

      {/* Reject Bid Modal */}
      {showRejectModal && selectedBidForReject && (
        <RejectBidModal
          bid={selectedBidForReject}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedBidForReject(null);
          }}
          onSubmit={handleReject}
          isSubmitting={isRejecting}
        />
      )}
    </div>
  );
}
