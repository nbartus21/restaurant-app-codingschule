import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '@/utils/api';
import { useToast } from "@/hooks/use-toast";

const PushNotificationManager = () => {
  const { isAdmin } = useOutletContext();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (isAdmin && 'serviceWorker' in navigator && 'PushManager' in window && userId) {
      registerServiceWorker();
    }
  }, [isAdmin, userId]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('user');
      setUserId(response.data.userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
        });
      }

      setSubscription(subscription);
      sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('Error registering service worker:', error);
      toast({
        title: "Notification Error",
        description: "Failed to enable push notifications. Please check your browser settings and try again.",
        variant: "destructive",
      });
    }
  };

  const sendSubscriptionToServer = async (subscription) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }
    try {
      const response = await api.post('/notifications/subscribe', {
        subscription: subscription.toJSON(),
        userId: userId
      });
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      toast({
        title: "Error",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to convert base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return null; // This component doesn't render anything
};

export default PushNotificationManager;