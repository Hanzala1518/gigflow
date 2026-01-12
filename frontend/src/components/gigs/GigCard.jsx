export default function GigCard({ gig }) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{gig.title}</h3>
        <span className={`badge-${gig.status} ml-2 flex-shrink-0`}>
          {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 flex-grow mb-4">{gig.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-lg font-bold text-primary-600">${gig.budget}</span>
        <span className="text-sm text-gray-500">
          by {gig.ownerId?.name || 'Unknown'}
        </span>
      </div>
    </div>
  );
}
