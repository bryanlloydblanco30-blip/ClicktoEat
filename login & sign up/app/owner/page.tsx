"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, Bell, Package, Clock, CheckCircle, XCircle, AlertCircle,
  ChefHat, LogOut
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "completed"
  | "rejected"
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

export default function OwnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 1, name: "John Santos", item: "Burger Meal", quantity: 2, totalPrice: 300, status: "pending" },
    { id: 2, name: "Maria Cruz", item: "Spaghetti", quantity: 1, totalPrice: 150, status: "pending" },
    { id: 3, name: "Alex Dela Vega", item: "Chicken Rice", quantity: 3, totalPrice: 450, status: "pending" },
  ]);

  const updateStatus = (orderId: number, newStatus: OrderStatus, reason?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, rejectReason: reason } : o
      )
    );
  };

  const handleReject = (orderId: number) => {
    const reason = prompt(`Please enter the reason for rejecting Order #${orderId}:`);
    if (reason && reason.trim() !== "") {
      updateStatus(orderId, "rejected", reason);
    } else {
      alert("Reject reason is required!");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "accepted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "preparing": return "bg-purple-100 text-purple-700 border-purple-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <ChefHat className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "cancelled": return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">FoodHub Dashboard</h1>
                  <p className="text-red-100 text-sm">Manage your canteen orders</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="w-6 h-6" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.status === "pending").length}
                </p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <ChefHat className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.status === "preparing").length}
                </p>
                <p className="text-xs text-gray-500">Preparing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {orders.filter(o => o.status === "completed").length}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-xl">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-600" />
          All Orders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Order #{order.id}</h2>
                        <p className="text-sm text-gray-500">{order.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Item:</span>
                        <span className="text-sm font-semibold text-gray-800">{order.item}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="text-sm font-semibold text-gray-800">×{order.quantity}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-semibold text-gray-600">Total:</span>
                        <span className="text-lg font-bold text-red-600">₱{order.totalPrice}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {order.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg"
                          onClick={() => updateStatus(order.id, "accepted")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg"
                          onClick={() => handleReject(order.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {order.status === "accepted" && (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-lg"
                        onClick={() => updateStatus(order.id, "preparing")}
                      >
                        <ChefHat className="w-4 h-4 mr-2" />
                        Start Preparing
                      </Button>
                    )}

                    {order.status === "preparing" && (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl shadow-lg"
                          onClick={() => updateStatus(order.id, "completed")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg"
                          onClick={() => updateStatus(order.id, "cancelled")}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {order.status === "completed" && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Order Completed
                        </p>
                      </div>
                    )}

                    {order.status === "rejected" && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-red-700 font-semibold flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5" />
                          Order Rejected
                        </p>
                        {order.rejectReason && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reason:</span> {order.rejectReason}
                          </p>
                        )}
                      </div>
                    )}

                    {order.status === "cancelled" && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-gray-700 font-semibold flex items-center justify-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Order Cancelled
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}