import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGig } from '../../store/slices/gigSlice';
import toast from 'react-hot-toast';
import Spinner from '../common/Spinner';

export default function CreateGigModal({ onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.gigs);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' ? value : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget < 1) {
      toast.error('Please enter a valid budget');
      return;
    }

    const result = await dispatch(
      createGig({
        title: formData.title,
        description: formData.description,
        budget,
      })
    );

    if (createGig.fulfilled.match(result)) {
      toast.success('Gig created successfully!');
      onClose();
    } else {
      toast.error(result.payload || 'Failed to create gig');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Post a New Gig</h2>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="label">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input"
                placeholder="e.g., Build a React Dashboard"
                value={formData.title}
                onChange={handleChange}
                minLength={5}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="input resize-none"
                placeholder="Describe the project requirements, skills needed, and deliverables..."
                value={formData.description}
                onChange={handleChange}
                minLength={20}
                maxLength={2000}
              />
            </div>

            <div>
              <label htmlFor="budget" className="label">
                Budget ($)
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                required
                min="1"
                step="1"
                className="input"
                placeholder="500"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex-1">
                {isLoading ? <Spinner size="sm" /> : 'Post Gig'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
