import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Header = ({ isAuthenticated, isAdmin, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-2">
          <img
            src="https://placehold.co/100x100"
            alt="Gourmet Haven Logo"
            width={32}
            height={32}
          />
          <span className="font-semibold text-xl">Gourmet Haven</span>
        </a>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">
            Home
          </Link>
          <Link
            to="/menu"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Menu
          </Link>
          <Link
            to="/reservation"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Reservations
          </Link>
        {isAdmin && <a
            href="/admin"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Admin Panel
          </a>}
        </nav>
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <Button
              onClick={onLogout}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Log out
            </Button>
          ) : (
            <div className="space-x-2">
              <Link to="/login">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <Link to="/profile" className="flex flex-col items-center ml-4">
              <span className="text-base text-gray-800 mt-1">Manage Account</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
