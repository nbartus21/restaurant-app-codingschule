import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const CheckoutCancelPage = () => {
  const [status, setStatus] = useState("processing");
  const location = useLocation();
  const navigate = useNavigate();
  const apiCallMade = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session_id");

    if (sessionId && !apiCallMade.current) {
      handleCancellation(sessionId);
    } else if (!sessionId) {
      setStatus("error");
    }
  }, [location]);

  const handleCancellation = async (sessionId) => {
    if (apiCallMade.current) return;
    apiCallMade.current = true;

    try {
      const response = await api.delete("/checkout/cancel/order", {
        data: { session_id: sessionId },
      });
      if (response.data.success) {
        setStatus("cancelled");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error handling cancellation:", error);
      setStatus("error");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === "processing" && <p>Processing your cancellation...</p>}
          {status === "cancelled" && (
            <>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Order Cancelled
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600"></p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Home
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Order Cancellation Error
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                There was an error processing your order cancellation. Please
                try again or contact support.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;
