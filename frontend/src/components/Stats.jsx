export default function Stats({ stats }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 text-center hover:border-indigo-500/50 transition-all">
        <div className="text-2xl font-bold text-indigo-400">{stats.total}</div>
        <div className="text-sm text-gray-400 mt-1">Total</div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 text-center hover:border-blue-500/50 transition-all">
        <div className="text-2xl font-bold text-blue-400">{stats.applied}</div>
        <div className="text-sm text-gray-400 mt-1">Applied</div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 text-center hover:border-yellow-500/50 transition-all">
        <div className="text-2xl font-bold text-yellow-400">{stats.interview}</div>
        <div className="text-sm text-gray-400 mt-1">Interviews</div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 text-center hover:border-green-500/50 transition-all">
        <div className="text-2xl font-bold text-green-400">{stats.offer}</div>
        <div className="text-sm text-gray-400 mt-1">Offers</div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 text-center hover:border-red-500/50 transition-all">
        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
        <div className="text-sm text-gray-400 mt-1">Rejected</div>
      </div>
    </div>
  );
}