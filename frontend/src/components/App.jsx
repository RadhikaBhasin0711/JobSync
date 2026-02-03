// src/components/App.jsx
import '../index.css';
import { useState, useEffect } from 'react';

function App() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', role: '', status: 'Applied', date: '', link: '' });
  const [editingStatusId, setEditingStatusId] = useState(null);

  // Load data from storage
  const loadApplications = () => {
    if (chrome?.storage?.sync) {
      chrome.storage.sync.get({ applications: [] }, (result) => {
        setApplications(result.applications || []);
      });
    } else {
      // Dev fallback
      setApplications([
        { id: 1, company: "Wipro", role: "Full Stack Developer", status: "Applied", date: "1 Feb 2026", link: "#" },
        { id: 2, company: "Valzo Soft Solutions", role: "Software Engineer", status: "Interview", date: "31 Jan 2026", link: "#" },
        { id: 3, company: "Amazon", role: "SDE Intern", status: "Rejected", date: "28 Jan 2026", link: "#" },
        { id: 4, company: "Google", role: "Frontend Engineer", status: "Offer", date: "3 Feb 2026", link: "#" },
      ]);
    }
  };

  // Load on mount + listen for changes from content script
  useEffect(() => {
    loadApplications();

    // Listen for storage changes (e.g. from content script)
    if (chrome?.storage?.onChanged) {
      const handleStorageChange = (changes, area) => {
        if (area === 'sync' && changes.applications) {
          loadApplications();  // Reload when applications change
        }
      };
      chrome.storage.onChanged.addListener(handleStorageChange);

      // Cleanup listener on unmount
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "Applied").length,
    interview: applications.filter(a => a.status === "Interview").length,
    offer: applications.filter(a => a.status === "Offer").length,
    rejected: applications.filter(a => a.status === "Rejected").length,
  };

  const filteredApps = filter === "All" 
    ? applications 
    : applications.filter(a => a.status === filter);

  const handleDelete = (id) => {
    if (confirm("Delete this application?")) {
      const updated = applications.filter(app => app.id !== id);
      setApplications(updated);
      if (chrome?.storage?.sync) {
        chrome.storage.sync.set({ applications: updated });
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    );
    setApplications(updated);
    setEditingStatusId(null);
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ applications: updated });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApp(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role || !newApp.date) return;

    const newEntry = {
      id: Date.now(),
      ...newApp,
    };

    const updated = [...applications, newEntry];
    setApplications(updated);
    setNewApp({ company: '', role: '', status: 'Applied', date: '', link: '' });
    setShowModal(false);

    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ applications: updated });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            JobSync
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {stats.total} applications tracked
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-5 py-2 rounded-full transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30"
            >
              + Add Application
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
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

      {/* Filter + Table */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Filter Dropdown */}
        <div className="mb-6 flex justify-end relative">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800/90 backdrop-blur-md border border-gray-600 text-gray-300 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-indigo-500/70 hover:border-indigo-500/50 transition-all shadow-sm w-40 cursor-pointer appearance-none"
          >
            <option value="All">All</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
        </div>

        {/* Table */}
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
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-800/40 transition-colors duration-200 group">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                      {app.company}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-300">
                      {app.role}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap relative">
                      {editingStatusId === app.id ? (
                        <div className="relative inline-block w-44">
                          <select
                            autoFocus
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            onBlur={() => setEditingStatusId(null)}
                            className="w-full bg-gray-900/95 backdrop-blur-md border border-gray-600 text-gray-200 text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none focus:border-indigo-500/70 shadow-lg appearance-none cursor-pointer"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
                        </div>
                      ) : (
                        <span 
                          onClick={() => setEditingStatusId(app.id)}
                          className={`inline-flex items-center justify-between gap-2 px-5 py-1.5 text-xs font-semibold rounded-xl border cursor-pointer transition-transform hover:scale-105 w-44 ${
                            app.status === 'Applied' ? 'bg-blue-950/60 text-blue-300 border-blue-800' :
                            app.status === 'Interview' ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800' :
                            app.status === 'Offer' ? 'bg-green-950/60 text-green-300 border-green-800' :
                            'bg-red-950/60 text-red-300 border-red-800'
                          } shadow-sm hover:shadow-md hover:border-indigo-500/50`}
                        >
                          <span>{app.status}</span>
                          <span className="text-gray-400 text-[10px] font-bold">▼</span>
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-400">
                      {app.date}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                      <a 
                        href={app.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 mr-5 transition-colors"
                      >
                        View
                      </a>
                      <button onClick={() => handleDelete(app.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApps.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              No applications match the filter.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-indigo-400 mb-6">Add New Application</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Company</label>
                <input type="text" name="company" value={newApp.company} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <input type="text" name="role" value={newApp.role} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              <div className="mb-4 relative">
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select name="status" value={newApp.status} onChange={handleInputChange} className="w-full bg-gray-800/90 backdrop-blur-sm border border-gray-600 text-gray-200 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-indigo-500/70 appearance-none shadow-sm">
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <span className="absolute right-4 top-[42px] text-gray-400 pointer-events-none text-xs">▼</span>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Date</label>
                <input type="text" name="date" value={newApp.date} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" required />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Link (optional)</label>
                <input type="text" name="link" value={newApp.link} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-500 hover:to-purple-500 transition">
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;