import Spinner from '../common/Spinner';

export default function BidCard({ bid, isOwner, isAssigned, isHiring, onHire }) {
  const statusColors = {
    pending: 'badge-pending',
    hired: 'badge-hired',
    rejected: 'badge-rejected',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">
            {bid.freelancerId?.name || 'Unknown Freelancer'}
          </h4>
          <p className="text-sm text-gray-500">{bid.freelancerId?.email}</p>
        </div>
        <span className={statusColors[bid.status]}>
          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
        </span>
      </div>

      <p className="text-gray-700 mb-4">{bid.message}</p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-primary-600">${bid.price}</span>

        {isOwner && bid.status === 'pending' && !isAssigned && (
          <button
            onClick={onHire}
            disabled={isHiring}
            className="btn-success"
          >
            {isHiring ? <Spinner size="sm" /> : 'Hire'}
          </button>
        )}

        {bid.status === 'hired' && (
          <span className="text-green-600 font-medium flex items-center">
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
      </div>
    </div>
  );
}
