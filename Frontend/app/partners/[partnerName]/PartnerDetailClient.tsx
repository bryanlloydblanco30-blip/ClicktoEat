'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  food_partner: string;
}

// API function - inline for demonstration
async function getPartnerMenuItems(partnerName: string) {
  const encodedName = encodeURIComponent(partnerName);
  const response = await fetch(`http://127.0.0.1:8000/api/partners/${encodedName}/items/`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

async function addToCart(menuItemId: number, quantity: number) {
  const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
  localStorage.setItem('sessionId', sessionId);
  
  const response = await fetch('http://127.0.0.1:8000/api/cart/add/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_item_id: menuItemId,
      quantity,
      session_id: sessionId
    })
  });
  
  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
}

export default function PartnerDetailClient() {
  const router = useRouter();
  const params = useParams();
  
  // CRITICAL FIX: Properly extract and validate partner name
  const rawPartnerName = params?.partnerName;
  
  // Handle both string and string[] cases from Next.js params
  const partnerName = Array.isArray(rawPartnerName) 
    ? rawPartnerName[0] 
    : rawPartnerName;
  
  console.log('=== FIXED DEBUG ===');
  console.log('Raw params:', params);
  console.log('Raw partner name:', rawPartnerName);
  console.log('Processed partner name:', partnerName);
  console.log('Is valid:', Boolean(partnerName && partnerName !== 'undefined'));
  console.log('==================');

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Validate partner name exists
  useEffect(() => {
    if (!partnerName || partnerName === 'undefined') {
      setError('Invalid partner name');
      setLoading(false);
      return;
    }
    
    loadPartnerItems();
  }, [partnerName]);

  const loadPartnerItems = async () => {
    if (!partnerName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const displayName = decodeURIComponent(partnerName);
      console.log('Fetching items for:', displayName);
      
      const data = await getPartnerMenuItems(displayName);
      console.log('API Response:', data);
      
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items);
        if (data.items.length === 0) {
          setError(`No items found for ${displayName}`);
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: MenuItem) => {
    try {
      setAddingToCart(item.id);
      await addToCart(item.id, 1);
      setToastMessage(`1x ${item.name}`);
      setShowToast(true);
      
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/partners')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  const displayName = partnerName ? decodeURIComponent(partnerName) : '';
  const categories = ['All', ...new Set(items.map(item => item.category).filter(Boolean))];
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
      
      <main className="p-4 max-w-7xl mx-auto">
        {/* Toast */}
        {showToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Added to Cart!</p>
                <p className="text-sm text-green-50">{toastMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          </div>
          <p className="text-gray-600">{items.length} items available</p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div 
                onClick={() => router.push(`/chosen-food?id=${item.id}`)}
                className="cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-red-600">₱{item.price}</span>
                    {item.category && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={addingToCart === item.id}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {addingToCart === item.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}