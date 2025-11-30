'use client'

import { useState, useEffect } from "react";
import { getOrders } from "../services/api";
import { motion } from "framer-motion";

type OrderItem = {
  name: string;
  quantity: number;
  price: string;
  subtotal: string;
};

type Order = {
  id: number;
  total: string;
  tip: string;
  payment_method: string;
  pickup_date: string;
  pickup_time: string;
  status: string;
  created_at: string;
  items: OrderItem[];
};

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      console.log('Orders fetched:', data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    // Handle time string (HH:MM:SS)
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading order history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center mb-6">
        <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h1 className="text-2xl font-semibold">Order History</h1>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-bold text-lg">Order #{order.id}</h2>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-red-600">₱{parseFloat(order.total).toFixed(2)}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>Pickup: {formatDate(order.pickup_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🕐</span>
                    <span>{formatTime(order.pickup_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💳</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <span>{order.items.length} item(s)</span>
                  <span>•</span>
                  <span>Click to {expandedOrder === order.id ? 'hide' : 'view'} details</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Order Items (Expandable) */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Order Items:</h3>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.quantity} x ₱{parseFloat(item.price).toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-red-600">₱{parseFloat(item.subtotal).toFixed(2)}</p>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t border-gray-300 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>₱{(parseFloat(order.total) - parseFloat(order.tip)).toFixed(2)}</span>
                      </div>
                      {parseFloat(order.tip) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tip:</span>
                          <span>₱{parseFloat(order.tip).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-red-600">₱{parseFloat(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-96 text-center">
          <div className="text-gray-300 mb-4">
            <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-600">No order history</h2>
          <p className="text-gray-500 mt-2">Your past orders will appear here</p>
        </div>
      )}
    </div>
  );
}