import { useState, useEffect, useRef } from 'react';
import Spinner from '../common/Spinner';

export default function PlaceBidModal({ gig, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    message: '',
    price: gig.budget.toString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    modalRef.current?.focus();
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isSubmitting]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double-submit
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        message: formData.message,
        price: parseFloat(formData.price),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="bid-modal-title">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />

        {/* Modal */}
        <div 
          ref={modalRef}
          tabIndex={-1}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-200 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id="bid-modal-title" className="text-2xl font-bold text-slate-900">Place a Bid</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg disabled:opacity-50"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-slate-600 font-medium mb-1">Bidding on:</p>
            <p className="font-bold text-slate-900">{gig.title}</p>
            <p className="text-sm text-blue-600 font-semibold mt-1">Budget: ${gig.budget}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="price" className="label">
                Your Price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="1"
                step="1"
                className="input"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="message" className="label">
                Cover Letter
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="input resize-none"
                placeholder="Introduce yourself and explain why you're the best fit for this gig..."
                value={formData.message}
                onChange={handleChange}
                minLength={10}
                maxLength={1000}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1 py-3">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3">
                {isSubmitting ? <Spinner size="sm" /> : 'Submit Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
