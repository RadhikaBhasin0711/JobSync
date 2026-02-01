export default function ApplicationsTable({ applications }) {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr className="bg-gray-950/50">
                <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-8 py-5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {applications.map((app) => (
                <tr 
                  key={app.id}
                  className="hover:bg-gray-800/40 transition-colors duration-200 group"
                >
                  <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {app.company}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-300">
                    {app.role}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                      app.status === 'Applied' ? 'bg-blue-950/60 text-blue-300 border-blue-800' :
                      app.status === 'Interview' ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800' :
                      app.status === 'Offer' ? 'bg-green-950/60 text-green-300 border-green-800' :
                      'bg-red-950/60 text-red-300 border-red-800'
                    } shadow-sm`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-400">
                    {app.date}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                    <a href={app.link} className="text-indigo-400 hover:text-indigo-300 mr-5 transition-colors">
                      View
                    </a>
                    <button className="text-red-400 hover:text-red-300 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            No applications saved yet. Keep applying!
          </div>
        )}
      </div>
    </div>
  );
}