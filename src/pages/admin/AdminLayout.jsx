import { Outlet, Link, useOutletContext } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PushNotificationManager from '@/components/PushNotificationManager';

const AdminLayout = () => {
  const navigate = useNavigate();
  const {token , isAdmin} = useOutletContext()

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col sm:flex-row bg-gray-100">
          <PushNotificationManager />
      <aside className="w-full sm:w-64 bg-white shadow-md">
        <nav className="mt-24">
          <Link to="/admin" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Dashboard</Link>
          <Link to="/admin/menu" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Manage Menu</Link>
          <Link to="/admin/order" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Manage Orders</Link>
          <Link to="/admin/reservation" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Manage Reservations</Link>
          <Link to="/admin/account" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Manage Admin Accounts</Link>
          {/* Add more admin navigation links here */}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet context={{token}} />
      </main>
    </div>
  );
};

export default AdminLayout;