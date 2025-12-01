'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
import Image from "next/image";

// Dynamically import charts with no SSR
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

type SalesByDay = {
  name: string;
  sales: number;
};

type OrdersByStatus = {
  name: string;
  value: number;
};

type Stats = {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
  totalOrders: number;
  salesToday: number;
  topProduct: string;
  salesByDay: SalesByDay[];
  ordersByStatus: OrdersByStatus[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clicktoeat-pw67.onrender.com';

import { getAllOrders } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
    totalOrders: 0,
    salesToday: 0,
    topProduct: "Loading...",
    salesByDay: [],
    ordersByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data...');
      const data = await getAllOrders();
      const orders = data.orders || [];
      
      console.log(`✅ Loaded ${orders.length} orders`);
      
      const pending = orders.filter((o: any) => o.status === 'pending').length;
      const confirmed = orders.filter((o: any) => o.status === 'confirmed').length;
      const preparing = orders.filter((o: any) => o.status === 'preparing').length;
      const ready = orders.filter((o: any) => o.status === 'ready').length;
      const completed = orders.filter((o: any) => o.status === 'completed').length;
      const cancelled = orders.filter((o: any) => o.status === 'cancelled').length;
      
      const salesByDay = calculateSalesByDay(orders);
      
      const today = new Date().toISOString().split('T')[0];
      const todaysOrders = orders.filter((o: any) => o.pickup_date === today);
      const salesToday = todaysOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
      
      const topProduct = findTopProduct(orders);
      
      const ordersByStatus = [
        { name: "Pending", value: pending },
        { name: "Confirmed", value: confirmed },
        { name: "Preparing", value: preparing },
        { name: "Ready", value: ready },
        { name: "Completed", value: completed },
        { name: "Cancelled", value: cancelled }
      ].filter(item => item.value > 0);

      setStats({
        pending,
        confirmed,
        preparing,
        ready,
        completed,
        cancelled,
        totalOrders: orders.length,
        salesToday,
        topProduct,
        salesByDay,
        ordersByStatus
      });
      
      setLoading(false);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const calculateSalesByDay = (orders: any[]): SalesByDay[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesMap: { [key: string]: number } = {};
    
    days.forEach(day => salesMap[day] = 0);
    
    orders.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const dayName = days[orderDate.getDay()];
      salesMap[dayName] += parseFloat(order.total);
    });
    
    return days.map(day => ({
      name: day,
      sales: parseFloat(salesMap[day].toFixed(2))
    }));
  };

  const findTopProduct = (orders: any[]): string => {
    const productCount: { [key: string]: number } = {};
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
      });
    });
    
    let topProduct = "No orders yet";
    let maxCount = 0;
    
    Object.entries(productCount).forEach(([name, count]: [string, any]) => {
      if (count > maxCount) {
        maxCount = count;
        topProduct = name;
      }
    });
    
    return topProduct;
  };

  const cardStyle = "rounded-2xl shadow-md p-4 flex flex-col gap-2 bg-white hover:shadow-lg transition-shadow duration-200";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">Error Loading Dashboard</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full p-4 md:p-6">
      {/* Welcome Message */}
      {user && (
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user.full_name || user.username}! 👋
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {user.role === 'admin' 
              ? 'Here\'s your restaurant overview' 
              : `Managing orders for ${user.food_partner}`
            }
          </p>
        </div>
      )}

      <div className="flex items-center mb-6">
        <Image src="/grid.png" height={30} width={30} alt="dashboard icon" />
        <h1 className="ml-3 text-xl md:text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={cardStyle}>
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <CardTitle className="text-base md:text-xl font-semibold">Pending Orders</CardTitle>
              <Clock className="h-5 w-5 md:h-6 md:w-6" color="#FF0000" />
            </CardHeader>
            <CardContent className="mt-4 text-3xl md:text-4xl font-bold p-0 text-red-600">
              {stats.pending}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={cardStyle}>
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <CardTitle className="text-base md:text-xl font-semibold">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6" color="#10B981"/>
            </CardHeader>
            <CardContent className="mt-4 text-3xl md:text-4xl font-bold p-0 text-green-600">
              {stats.completed}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={cardStyle}>
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <CardTitle className="text-base md:text-xl font-semibold">Total Orders</CardTitle>
              <Users className="h-5 w-5 md:h-6 md:w-6" color="#3B82F6" />
            </CardHeader>
            <CardContent className="mt-4 text-3xl md:text-4xl font-bold p-0 text-blue-600">
              {stats.totalOrders}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mt-6">
        <Card className="p-4 rounded-2xl shadow-md bg-white">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base md:text-xl font-semibold">Sales Over Time (This Week)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isClient ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.salesByDay} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip formatter={(value) => `₱${value}`} />
                    <Line type="monotone" dataKey="sales" stroke="#ff6467" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-[250px] flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-400">Loading chart...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 rounded-2xl shadow-md bg-white">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base md:text-xl font-semibold">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isClient ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ordersByStatus} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}> 
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff6467" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-[250px] flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-400">Loading chart...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
        <Card className="rounded-2xl shadow-md p-4 bg-white">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-base md:text-xl font-semibold">Total Sales Today</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-2xl md:text-4xl font-bold text-green-600">
            ₱{stats.salesToday.toFixed(2)}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md p-4 bg-white">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-base md:text-xl font-semibold">Top Product</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4 text-lg md:text-2xl font-semibold break-words text-gray-700">
            {stats.topProduct}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}