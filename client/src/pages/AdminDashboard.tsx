import React, { useState } from 'react';
import { artists } from '../data/artists';
import { Plus, Edit2, Trash2, Search, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('artists');

  const handleLogout = () => {
    setLocation('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-serif font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'artists' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('artists')}
          >
            Manage Artists
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold">Artists</h2>
            <Link href="/admin/add">
              <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <Plus size={18} />
                Add New Artist
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search artists..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-medium">
                    <th className="px-6 py-4">Artist</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Prices (Trial / Wedding)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {artists.map(artist => (
                    <tr key={artist.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={artist.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                          <div>
                            <p className="font-medium text-gray-900">{artist.name}</p>
                            <p className="text-xs text-gray-500">{artist.style}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{artist.city}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${artist.trialPrice} / <span className="text-primary font-medium">${artist.weddingPrice}</span>
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={artist.active} />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 rounded-lg">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}