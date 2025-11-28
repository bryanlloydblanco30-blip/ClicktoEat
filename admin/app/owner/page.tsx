"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

interface Order {
  id: number;
  name: string;
  item: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  rejectReason?: string;
}

    function OwnerContent() {
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        const userParam = searchParams.get('user');
        
        if (userParam) {
        try {
            const user = JSON.parse(decodeURIComponent(userParam));
            
            if (user.role !== 'staff') {
            window.location.href = 'http://localhost:3000/login';
            return;
            }
            
            localStorage.setItem('user', JSON.stringify(user));
            setUserInfo(user);
            loadOrders(user.food_partner);
        } catch (error) {
            console.error('Error parsing user data:', error);
            window.location.href = 'http://localhost:3000/login';
        }
        } else {
        const userStr = localStorage.getItem('user');
        
        if (!userStr) {
            window.location.href = 'http://localhost:3000/login';
            return;
        }

        try {
            const user = JSON.parse(userStr);
            
            if (user.role !== 'staff') {
            window.location.href = 'http://localhost:3000/login';
            return;
            }

            setUserInfo(user);
            loadOrders(user.food_partner);
        } catch (error) {
            console.error('Auth error:', error);
            window.location.href = 'http://localhost:3000/login';
        }
        }
    }, [searchParams]);

    const loadOrders = async (foodPartner: string) => {
    try {
        console.log('🔍 Loading orders for:', foodPartner);
        
        const url = `http://localhost:8000/api/partner/orders/?partner=${encodeURIComponent(foodPartner)}`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
        console.error('❌ Backend error:', response.status, response.statusText);
        throw new Error(`Backend returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Backend response:', data);
        
        if (!data.orders || data.orders.length === 0) {
        console.log('ℹ️ No orders found for this partner');
        setOrders([]);
        setLoading(false);
        return;
        }
        
        const transformedOrders = data.orders.map((order: any) => ({
        id: order.id,
        name: order.customer_name,
        item: order.items.map((i: any) => i.name).join(', '),
        quantity: order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
        totalPrice: parseFloat(order.total),
        status: order.status as OrderStatus
        }));
        
        console.log('✅ Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        alert('Failed to load orders. Please check your connection and try again.');
        setOrders([]); // Empty state - no fake data
    } finally {
        setLoading(false);
    }
    };

  const updateStatus = async (orderId: number, newStatus: OrderStatus, reason?: string) => {
    try {
      console.log(`🔄 Updating order #${orderId} to ${newStatus}`);
      
      const response = await fetch(`http://localhost:8000/api/partner/orders/${orderId}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        console.log(`✅ Order #${orderId} updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus, rejectReason: reason } : o
          )
        );
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const handleReject = (orderId: number) => {
    const reason = prompt(`Please enter the reason for cancelling Order #${orderId}:`);
    if (reason && reason.trim() !== "") {
      updateStatus(orderId, "cancelled", reason);
    } else {
      alert("Cancellation reason is required!");
    }
  };

  const handleLogout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('food_partner');
    window.location.href = 'http://localhost:3000/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Incoming Orders</h1>
          {userInfo && (
            <p className="text-gray-600 mt-2">
              {userInfo.food_partner} • Staff: {userInfo.username}
            </p>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No orders yet for {userInfo?.food_partner}</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow-xl border rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-2xl font-semibold">Order #{order.id}</h2>
              <p className="text-sm text-gray-500">ID: {order.id}</p>
              <p className="text-lg"><strong>Name:</strong> {order.name}</p>
              <p className="text-lg"><strong>Item:</strong> {order.item}</p>
              <p className="text-lg"><strong>Quantity:</strong> {order.quantity}</p>
              <p className="text-lg font-semibold">Total Price: ₱{order.totalPrice}</p>
              <p className="text-sm font-medium">
                Status: <span className="text-orange-600 font-bold">{order.status.toUpperCase()}</span>
              </p>

              {/* Pending - Accept or Cancel */}
              {order.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                    onClick={() => updateStatus(order.id, "confirmed")}
                  >
                    Accept
                  </button>
                  <button
                    className="flex-1 border-2 border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition font-semibold"
                    onClick={() => handleReject(order.id)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Confirmed - Start Preparing */}
              {order.status === "confirmed" && (
                <button
                  className="w-full border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                  onClick={() => updateStatus(order.id, "preparing")}
                >
                  Start Preparing
                </button>
              )}

              {/* Preparing - Mark Ready or Cancel */}
              {order.status === "preparing" && (
                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                    onClick={() => updateStatus(order.id, "ready")}
                  >
                    Ready for Pickup
                  </button>
                  <button
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    onClick={() => updateStatus(order.id, "cancelled")}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Ready - Mark Complete */}
              {order.status === "ready" && (
                <button
                  className="w-full border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition font-semibold"
                  onClick={() => updateStatus(order.id, "completed")}
                >
                  Mark as Completed
                </button>
              )}

              {/* Completed */}
              {order.status === "completed" && (
                <p className="text-green-600 font-semibold text-center py-2">✅ Completed</p>
              )}

              {/* Cancelled */}
              {order.status === "cancelled" && (
                <div className="space-y-1 bg-red-50 p-3 rounded">
                  <p className="text-red-600 font-semibold">❌ Cancelled</p>
                  {order.rejectReason && (
                    <p className="text-sm text-gray-700">
                      Reason: {order.rejectReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OwnerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <OwnerContent />
    </Suspense>
  );
}