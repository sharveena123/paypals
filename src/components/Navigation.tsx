import { Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Left: Logo */}
        <Link to="/dashboard" className="flex items-center font-bold text-xl text-blue-600">
          <img src="/favicon.ico" alt="PayPals" className="w-8 h-8 mr-2" />
          PayPals
        </Link>
        {/* Center: Nav Links */}
        <div className="flex space-x-6">
          <Link
            to="/groups"
            className={`font-medium hover:text-blue-600 transition ${
              location.pathname.startsWith("/groups") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Groups
          </Link>
          <Link
            to="/friends"
            className={`font-medium hover:text-blue-600 transition ${
              location.pathname.startsWith("/friends") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Friends
          </Link>
          <Link
            to="/expenses"
            className={`font-medium hover:text-blue-600 transition ${
              location.pathname.startsWith("/expenses") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Expenses
          </Link>
        </div>
        {/* Right: Profile */}
        <Link
          to="/profile"
          className="flex items-center space-x-2 font-medium text-gray-700 hover:text-blue-600 transition"
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </header>
  );
};

export default Navigation;
