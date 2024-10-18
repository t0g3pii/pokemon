import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Willkommen beim Pokémon GO Feldforschungs-Tracker</h1>
      <Compass className="mx-auto mb-6" size={64} />
      <p className="text-xl mb-8">
        Verfolge deine Fortschritte bei Feldforschungen und verpasse keine Belohnungen mehr!
      </p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Anmelden
        </Link>
        <Link to="/register" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Registrieren
        </Link>
      </div>
    </div>
  );
};

export default Home;