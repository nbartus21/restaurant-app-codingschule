import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import MenuPage from './pages/MenuPage.jsx'
import ReservationPage from './pages/ReservationPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminMenuPage from './pages/admin/AdminMenuPage.jsx'
import { CartProvider } from './context/CartContext.jsx'
import CheckoutSuccessPage from './pages/CheckoutSuccessPage.jsx'
import AdminOrderPage from './pages/admin/AdminOrderPage.jsx'
import AdminReservationPage from './pages/admin/AdminReservationPage.jsx'
import CheckoutCancelPage from './pages/CheckoutCancelPage.jsx'
import AdminAccountCreate from './pages/admin/AdminAccountCreate.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path : "/menu",
        element : <MenuPage/>
      },
      {
        path: '/reservation',
        element: <ReservationPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignUpPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            path: '/admin',
            element: <AdminDashboard />,
          },
          {
            path: '/admin/menu',
            element: <AdminMenuPage />,
          },
          {
            path: '/admin/order',
            element: <AdminOrderPage />,
          },
          {
            path: '/admin/reservation',
            element: <AdminReservationPage />,
          },
          {
            path: '/admin/account',
            element: <AdminAccountCreate />,
          },
        ],
      },
      {
        path: '/checkout/success',
        element: <CheckoutSuccessPage />,
      },
      {
        path: '/reservation/success',
        element: <CheckoutSuccessPage />,
      },
      {
        path : "/checkout/cancel",
        element : <CheckoutCancelPage/>
      }
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
    <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>,
)
