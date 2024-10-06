import { useEffect, useState , useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CheckoutSuccessPage = () => {
  const [status, setStatus] = useState('processing');
  const [paymentType, setPaymentType] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const apiCallMade = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    const type = location.pathname.includes('reservation') ? 'reservation' : 'menu';
    setPaymentType(type);

    if (sessionId && !apiCallMade.current) {
      handlePaymentSuccess(sessionId, type);
    } else if (!sessionId) {
      setStatus('error');
    }
  }, [location]);

  const handlePaymentSuccess = async (sessionId, type) => {
    if (apiCallMade.current) return;
    apiCallMade.current = true;

    try {
      const endpoint = type === 'reservation' ? '/reservations/success' : '/checkout/success';
      const response = await api.get(`${endpoint}?session_id=${sessionId}`);
      if (response.data.orderId || response.data.reservationId) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      if (error.response && error.response.data && error.response.data.message.includes('already processed')) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'processing' && <p>Processing your payment...</p>}
          {status === 'success' && (
            <>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Payment Successful!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {paymentType === 'reservation'
                  ? 'Thank you for your reservation. Your table has been booked.'
                  : 'Thank you for your order. Your order has been placed and will be processed shortly.'}
              </p>
              <button
                onClick={() => navigate(paymentType === 'reservation' ? '/profile' : '/profile')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {paymentType === 'reservation' ? 'View Reservation' : 'View Order'}
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Payment Error
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                There was an error processing your payment. Please try again or contact support.
              </p>
              <button
                onClick={() => navigate(paymentType === 'reservation' ? '/reservation' : '/cart')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {paymentType === 'reservation' ? 'Return to Reservation' : 'Return to Cart'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;