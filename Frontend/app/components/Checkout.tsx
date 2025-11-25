import { motion } from "framer-motion"

// File: Frontend/app/mycart/checkout/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, getCart } from '@/app/services/api';
import { useToast } from '@/app/components/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedTip, setSelectedTip] = useState(0);
  const [pickupTime, setPickupTime] = useState('');
  
  // ... your other state and useEffect code ...

  // 🔍 FIND THIS FUNCTION AND UPDATE IT:
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      
      // ✅ ADD THIS: Get user info from localStorage
      const userStr = localStorage.getItem('user');
      let customerName = 'Guest';
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          customerName = user.full_name || user.username || 'Guest';
        } catch (error) {
          console.error('Error parsing user:', error);
        }
      }
      
      const orderData = {
        payment_method: selectedPayment,
        tip: selectedTip,
        pickup_time: pickupTime,
        customer_name: customerName  // ✅ ADD THIS LINE
      };
      
      const response = await createOrder(orderData);
      
      if (response.success) {
        showToast('Order placed successfully!', 'green');
        router.push(`/order-confirmation/${response.order_id}`);
      }
    } catch (error: any) {
      console.error('Order error:', error);
      showToast(error.message || 'Failed to place order', 'red');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... your JSX code ...
  );
}
export default function Checkout(handleCheckout:any){
    return(
        <motion.button
            className="bg-main-red text-white px-6 py-2 rounded-lg font-semibold cursor-pointer hover:bg-red-600 transition"
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckout}
          >
            Checkout
          </motion.button>
    )
}