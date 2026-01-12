import { useState } from 'react';
import { useSelector } from 'react-redux';
import Spinner from '../common/Spinner';

export default function PlaceBidModal({ gig, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    message: '',
    price: gig.budget.toString(),
  });

  const { isLoading } = useSelector((state) => state.bids);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      message: formData.message,
      price: parseFloat(formData.price),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Place a Bid</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Bidding on:</p>
            <p className="font-medium text-gray-900">{gig.title}</p>
            <p className="text-sm text-gray-500">Budget: ${gig.budget}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                {isLoading ? <Spinner size="sm" /> : 'Submit Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
