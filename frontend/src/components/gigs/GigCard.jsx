import { Link } from 'react-router-dom';

export default function GigCard({ gig }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col hover:shadow-md transition-all duration-150">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{gig.title}</h3>
        <span className={`badge-${gig.status} flex-shrink-0`}>
          {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
        </span>
      </div>

      <p className="text-sm text-slate-500 line-clamp-3 flex-grow mb-4">{gig.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
        <span className="text-base font-semibold text-blue-600">${gig.budget}</span>
        <span className="text-xs text-slate-400">
          by {gig.ownerId?.name || 'Unknown'}
        </span>
      </div>

      <Link
        to={`/app/gigs/${gig._id}`}
        className="w-full text-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150"
      >
        View Details
      </Link>
    </div>
  );
}
