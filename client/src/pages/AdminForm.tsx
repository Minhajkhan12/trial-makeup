import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, UploadCloud, GripVertical, Plus } from 'lucide-react';

export default function AdminForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEdit = !!params.id;

  const [active, setActive] = useState(true);
  const [skinTones, setSkinTones] = useState<number[]>([]);
  const [hairTypes, setHairTypes] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<{url: string, caption: string}[]>([]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    setLocation('/admin/dashboard');
  };

  const toggleSkinTone = (tone: number) => {
    setSkinTones(prev => 
      prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
    );
  };

  const toggleHairType = (type: string) => {
    setHairTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - simplified for this view */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-serif font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setLocation('/admin/dashboard')}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setLocation('/admin/dashboard')}
              className="md:hidden p-2 bg-white rounded-lg border border-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-3xl font-serif font-bold">
              {isEdit ? 'Edit Artist' : 'Add New Artist'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">Active Profile</span>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only peer" checked={active} onChange={(e) => setActive(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="">Select city...</option>
                    <option value="Toronto">Toronto</option>
                    <option value="Waterloo">Waterloo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Makeup Style</label>
                  <input type="text" required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Soft Glam" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <input type="number" step="0.1" required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="5.0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviews</label>
                    <input type="number" required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trial Price ($)</label>
                  <input type="number" required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="250" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Price ($)</label>
                  <input type="number" required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="450" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About</label>
                <textarea rows={4} required className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Tell us about the artist's background and approach..."></textarea>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <h3 className="font-semibold text-lg border-b border-gray-100 pb-4">Diversity & Inclusion</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Skin Tones (Fitzpatrick Scale)</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5, 6].map(tone => {
                    const colors = ['#FBE2D5', '#E6C6AC', '#D2A17E', '#A67153', '#72462F', '#3E2015'];
                    const isSelected = skinTones.includes(tone);
                    return (
                      <button 
                        type="button"
                        key={tone}
                        onClick={() => toggleSkinTone(tone)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: colors[tone - 1] }}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Hair Types</label>
                <div className="flex flex-wrap gap-2">
                  {['Fine', 'Straight', 'Wavy', 'Curly', 'Coily', 'Thick', 'Textured'].map(type => {
                    const isSelected = hairTypes.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => toggleHairType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diversity Note</label>
                <textarea rows={3} className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Optional note about experience with diverse skin tones and hair types..."></textarea>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <h3 className="font-semibold text-lg border-b border-gray-100 pb-4">Media</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <UploadCloud className="text-gray-400 mb-3" size={32} />
                  <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Portfolio Gallery</label>
                  <button type="button" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                    <Plus size={14} /> Add Image
                  </button>
                </div>
                
                {/* Mock empty state for portfolio */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-center text-gray-500 py-4">No portfolio images added yet.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 pb-12">
              <button 
                type="button"
                onClick={() => setLocation('/admin/dashboard')}
                className="px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save Artist
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}