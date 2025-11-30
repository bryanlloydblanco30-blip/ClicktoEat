'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder, getCart } from "../../services/api";
import { useToast } from "../../components/Toast";

const paymentMethods = [
    {id: 0, name: 'Cash payment', img: '/payment-method/payment-method.png'},
    {id: 1, name: 'gcash', img: '/payment-method/gcash.png'},
    {id: 2, name: 'paymaya', img: '/payment-method/maya.png'}
]

type CartItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  subtotal: string;
  image_url: string;
  category: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [tip, setTip] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadCheckout();
  }, []);

  const checkAuthAndLoadCheckout = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in - check multiple possible keys
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
      const user = localStorage.getItem('user');
      
      // Debug: log what's in localStorage
      console.log('Auth check:', { token: !!token, userId: !!userId, user: !!user });
      console.log('localStorage keys:', Object.keys(localStorage));
      
      if (!token && !user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      await loadCheckoutItems();
    } catch (error) {
      console.error('Error:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadCheckoutItems = async () => {
    try {
      const storedItemIds = sessionStorage.getItem('checkout_item_ids');
      
      if (!storedItemIds) {
        setLoading(false);
        return;
      }

      const itemIds = JSON.parse(storedItemIds) as number[];
      const cartData = await getCart();
      const selectedCartItems = cartData.cart.filter((item: CartItem) => itemIds.includes(item.id));
      
      setSelectedItems(selectedCartItems);
    } catch (error) {
      console.error('Error loading checkout items:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  
  const total = selectedItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  const handleConfirmOrder = async () => {
    if (!selectedPayment) {
      showToast("Please select a payment method", "red");
      return;
    }
    if (!pickupTime) {
      showToast("Please set pickup time", "red");
      return;
    }

    setIsSubmitting(true);

    try {
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

      const response = await createOrder({
        payment_method: selectedPayment,
        tip: tip,
        pickup_time: pickupTime,
        customer_name: customerName
      });

      if (response.success) {
        showToast(`Order #${response.order_id} submitted successfully!`, "green");
        sessionStorage.removeItem('checkout_item_ids');
        window.dispatchEvent(new Event('cartUpdated'));
        router.push('/');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to submit order: ${errorMessage}`, "red");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-6">
        <div className="flex items-center mb-6">
          <Image src="/shopping-cart.png" height={30} width={30} alt="shopping cart icon" />
          <h1 className="ml-3 text-xl md:text-2xl font-semibold">Checkout</h1>
        </div>

        <div className="flex flex-col justify-center items-center h-96 text-center">
          <div className="text-gray-300 mb-4">
            <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Please Log In</h2>
          <p className="text-gray-500 mb-6">You need to log in to checkout</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center mb-4">
        <Image src="/shopping-cart.png" height={30} width={30} alt="shopping cart icon" />
        <h1 className="ml-3 text-xl md:text-2xl font-semibold">Checkout</h1>
      </div>

      {selectedItems.length === 0 ? (
        <section className="flex flex-col items-center">
          <Image src="/empty-cart.png" width={200} height={200} alt="Empty Cart" />
          <h2 className="text-xl font-semibold mt-4 text-gray-600">No items selected for checkout</h2>
          <Link href="/mycart" className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Back to Cart
          </Link>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <h2 className="font-bold text-lg">Order Items</h2>
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div className="flex items-center gap-4">
                  <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-16 h-16 rounded-lg object-cover border" />
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-gray-600 text-sm">{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <p className="font-semibold text-red-600">₱{parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-bold text-lg mb-2">Payment Methods</p>
              <div className="grid gap-3">
                {paymentMethods.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPayment(item.name)}
                    className={`flex items-center gap-3 w-full p-3 border rounded-lg transition ${
                      selectedPayment === item.name ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Image src={item.img} alt={item.name} width={40} height={30} className="object-contain" />
                    <h3 className={selectedPayment === item.name ? 'text-red-600 font-semibold' : ''}>{item.name}</h3>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-2">Tip</h2>
              <div className="flex gap-3 mb-2">
                {[5, 10, 20].map(amount => (
                  <button
                    key={amount}
                    className={`px-4 py-2 border rounded-lg transition ${
                      tip === amount ? "border-red-600 bg-red-50 text-red-600" : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setTip(amount)}
                  >
                    ₱{amount}.00
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom Tip"
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                value={tip || ""}
                min={0}
                onChange={(e) => setTip(Number(e.target.value))}
                onKeyDown={(e) => { if (e.key === "-" || e.key === "e") e.preventDefault(); }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h1 className="font-semibold text-lg">Time of Pickup</h1>
            <input
              type="datetime-local"
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Subtotal: ₱{total.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Tip: ₱{tip.toFixed(2)}</p>
              <p className="font-bold text-xl text-red-600 mt-1">Total: ₱{(total + tip).toFixed(2)}</p>
            </div>
            <button
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}