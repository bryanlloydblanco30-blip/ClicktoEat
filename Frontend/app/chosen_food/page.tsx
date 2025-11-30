'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getMenuItems, addToCart } from '../services/api';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  food_partner: string;
}

function ChosenFoodContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      loadMenuItem(id);
    }
  }, [id]);

  const loadMenuItem = async (itemId: string) => {
    try {
      setLoading(true);
      const data = await getMenuItems();
      const foundItem = data.items?.find((item: MenuItem) => item.id.toString() === itemId);
      
      if (foundItem) {
        setItem(foundItem);
      } else {
        console.error('Item not found');
      }
    } catch (error) {
      console.error('Error loading item:', error);
      alert('Failed to load food item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!item) return;
    
    try {
      setAddingToCart(true);
      await addToCart(item.id, quantity);
      alert(`✓ ${quantity}x ${item.name} added to cart!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  if (loading) {
    return (
      <main className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading food item...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Food item not found</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-red-600 hover:text-red-700"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const totalPrice = (parseFloat(item.price) * quantity).toFixed(2);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-96 w-full bg-gray-100">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
            {item.food_partner && (
              <p className="text-gray-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                {item.food_partner}
              </p>
            )}
          </div>

          {item.description && (
            <p className="text-gray-700 mb-6 text-lg">{item.description}</p>
          )}

          <div className="flex items-center justify-between mb-6">
            <span className="text-4xl font-bold text-red-600">₱{item.price}</span>
            {item.category && (
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                {item.category}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={decrementQuantity}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-xl font-bold transition"
              >
                -
              </button>
              <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center text-xl font-bold transition"
              >
                +
              </button>
              <span className="ml-4 text-xl text-gray-600">
                Total: <span className="font-bold text-red-600">₱{totalPrice}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ChosenFoodPage() {
  return (
    <Suspense fallback={
      <main className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <ChosenFoodContent />
    </Suspense>
  );
}