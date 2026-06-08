import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../api';

export const usePaymentStatus = () => {
  const [settings, setSettings] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, p] = await Promise.all([
          axios.get(`${API}/admin/payment-settings`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/payments/my-payments`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setSettings(s.data);
        setPayments(p.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch();
  }, [token]);

  const isPaid = () => {
    if (!settings?.payments_active || !settings?.monthly_active) return true; // Free
    const approved = payments.find(p => p.status === 'approved');
    if (!approved) return false;
    const daysSince = Math.floor((new Date() - new Date(approved.payment_date)) / (1000 * 60 * 60 * 24));
    return daysSince < 30;
  };

  return { isPaid: isPaid(), loading, settings, payments };
};