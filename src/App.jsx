import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Toaster } from "@/components/ui/toaster"


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const location = useLocation();


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      checkAdminStatus(storedToken);
    }else{
      setAdminChecked(true);
    }
    setAuthChecked(true);
  }, []);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const checkAdminStatus = async (token) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/checkAdmin', {
        headers: {
          'x-auth-token': token
        }
      });
      const data = await response.json();
      if (response.status === 401 && data.message === 'Token expired') {
        handleLogout();
        return;
      }
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setAdminChecked(true);
    }
  };
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    checkAdminStatus(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (!authChecked || !adminChecked) {
    return <>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
  <div className="loader"></div>
  </div>
    </>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={handleLogout} />
      <Outlet context={{ isAuthenticated, isAdmin, token, onLogin: handleLogin }} />
      <Footer />
      <Toaster/>
    </div>
  );
}