import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface FieldResearch {
  id: number;
  title: string;
  totalStages: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [fieldResearches, setFieldResearches] = useState<FieldResearch[]>([]);
  const [newResearch, setNewResearch] = useState({ title: '', totalStages: 1 });

  useEffect(() => {
    fetchFieldResearches();
  }, []);

  const fetchFieldResearches = async () => {
    try {
      const response = await fetch('/api/admin/field-researches', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFieldResearches(data);
      }
    } catch (error) {
      console.error('Failed to fetch field researches:', error);
    }
  };

  const handleCreateResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/field-researches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newResearch),
      });
      if (response.ok) {
        setNewResearch({ title: '', totalStages: 1 });
        fetchFieldResearches();
      }
    } catch (error) {
      console.error('Failed to create field research:', error);
    }
  };

  const handleDeleteResearch = async (id: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Feldforschung löschen möchten?')) {
      try {
        const response = await fetch(`/api/admin/field-researches/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        if (response.ok) {
          fetchFieldResearches();
        }
      } catch (error) {
        console.error('Failed to delete field research:', error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Neue Feldforschung erstellen</h2>
        <form onSubmit={handleCreateResearch} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1">Titel</label>
            <input
              type="text"
              id="title"
              value={newResearch.title}
              onChange={(e) => setNewResearch({ ...newResearch, title: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="totalStages" className="block mb-1">Anzahl der Stufen</label>
            <input
              type="number"
              id="totalStages"
              value={newResearch.totalStages}
              onChange={(e) => setNewResearch({ ...newResearch, totalStages: parseInt(e.target.value) })}
              min="1"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center">
            <Plus size={20} className="mr-2" />
            Feldforschung erstellen
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Vorhandene Feldforschungen</h2>
        <ul className="space-y-4">
          {fieldResearches.map(research => (
            <li key={research.id} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{research.title}</h3>
                <p className="text-gray-600">Stufen: {research.totalStages}</p>
              </div>
              <div className="space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDeleteResearch(research.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;