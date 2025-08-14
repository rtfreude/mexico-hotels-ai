import { MapPin, Sun } from 'lucide-react';

function Header() {
  return (
    <header className="bg-white shadow-md border-b-4 border-mexico-green">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sun className="h-8 w-8 text-mexico-gold" />
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Mexico Hotels AI
            </h1>
            <MapPin className="h-6 w-6 text-mexico-red" />
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-mexico-green transition-colors">
              Hotels
            </a>
            <a href="#" className="text-gray-700 hover:text-mexico-green transition-colors">
              Destinations
            </a>
            <a href="#" className="text-gray-700 hover:text-mexico-green transition-colors">
              About
            </a>
            <button className="btn-primary">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
