export default function GigCard({ gig }) {
  return (
    <div className="group card p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col border-2 border-transparent hover:border-blue-500/20">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{gig.title}</h3>
        <span className={`badge-${gig.status} ml-2 flex-shrink-0`}>
          {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
        </span>
      </div>

      <p className="text-slate-600 text-sm line-clamp-3 flex-grow mb-4">{gig.description}</p>

      <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 group-hover:border-blue-100 transition-colors">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">₹{gig.budget}</span>
        <span className="text-sm text-slate-500 font-medium">
          by {gig.ownerId?.name || 'Unknown'}
        </span>
      </div>
    </div>
  );
}
