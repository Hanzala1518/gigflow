import Spinner from '../common/Spinner';

export default function BidCard({ bid, isOwner, isAssigned, isHiring, isRejecting, onHire, onReject }) {
  const statusColors = {
    pending: 'badge-pending',
    hired: 'badge-hired',
    rejected: 'badge-rejected',
  };

  return (
    <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-slate-900">
            {bid.freelancerId?.name || 'Unknown Freelancer'}
          </h4>
          <p className="text-sm text-slate-500 mt-1">{bid.freelancerId?.email}</p>
        </div>
        <span className={statusColors[bid.status]}>
          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
        </span>
      </div>

      <p className="text-slate-700 mb-4 leading-relaxed">{bid.message}</p>

      {/* Rejection Reason Display */}
      {bid.status === 'rejected' && bid.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
          <p className="text-sm text-red-600">{bid.rejectionReason}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">${bid.price}</span>

        {isOwner && bid.status === 'pending' && !isAssigned && (
          <div className="flex gap-2">
            <button
              onClick={onReject}
              disabled={isRejecting || isHiring}
              className="px-4 py-2 border-2 border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRejecting ? <Spinner size="sm" /> : 'Reject'}
            </button>
            <button
              onClick={onHire}
              disabled={isHiring || isRejecting}
              className="btn-success"
            >
              {isHiring ? <Spinner size="sm" /> : 'Hire'}
            </button>
          </div>
        )}

        {bid.status === 'hired' && (
          <span className="text-emerald-600 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Hired
          </span>
        )}

        {bid.status === 'rejected' && (
          <span className="text-red-600 font-semibold flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Rejected
          </span>
        )}
      </div>
    </div>
  );
}
