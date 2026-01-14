import { useState } from 'react';
import Spinner from '../common/Spinner';

export default function RejectBidModal({ bid, onClose, onSubmit, isSubmitting }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any previous error
    setError('');

    // Validate length if provided
    if (rejectionReason.length > 500) {
      setError('Rejection reason cannot exceed 500 characters');
      return;
    }

    onSubmit(rejectionReason.trim() || null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Reject Bid</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Bid Info */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600">
                Rejecting bid from <span className="font-semibold text-slate-900">{bid.freelancerId?.name}</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Bid amount: <span className="font-semibold text-blue-600">₹{bid.price}</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for rejection <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="rejectionReason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Let the freelancer know why their bid wasn't selected..."
                  className="input-field resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">
                    This message will be visible to the freelancer
                  </span>
                  <span className={`text-xs ${rejectionReason.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {rejectionReason.length}/500
                  </span>
                </div>
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border-2 border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-2">Rejecting...</span>
                    </>
                  ) : (
                    'Reject Bid'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
