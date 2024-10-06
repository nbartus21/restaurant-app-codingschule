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
