import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Pokémon GO Feldforschungen</Link>
        <nav>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              {user.isAdmin && <Link to="/admin" className="hover:text-blue-200">Admin</Link>}
              <button onClick={logout} className="flex items-center hover:text-blue-200">
                <LogOut className="mr-1" size={18} />
                Abmelden
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="hover:text-blue-200">Anmelden</Link>
              <Link to="/register" className="hover:text-blue-200">Registrieren</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;