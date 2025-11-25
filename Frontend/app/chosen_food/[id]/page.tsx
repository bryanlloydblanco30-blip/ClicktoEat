'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/app/components/Toast";
import { getMenuItems, addToCart, getFavoriteIds, addFavorite, removeFavorite } from "@/app/services/api";
import { useParams } from "next/navigation";

export default function ChosenFood() {
  const params = useParams();
  const id = params?.id as string;

  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { showToast } = useToast();

  // Fetch menu item data and favorite status
  useEffect(() => {
    if (id) {
      loadFoodItem();
      loadFavoriteStatus();
    }
  }, [id]);

  const loadFoodItem = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems();
      
      if (response.items) {
        const foundFood = response.items.find((item: any) => {
          return item.id === parseInt(id);
        });
        
        if (foundFood) {
          setFood(foundFood);
        } else {
          setFood(null);
        }
      }
    } catch (error) {
      console.error('Error loading food item:', error);
      showToast('Failed to load food item', 'red');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async () => {
    try {
      const response = await getFavoriteIds();
      if (response.favorite_ids) {
        setIsFavorite(response.favorite_ids.includes(parseInt(id)));
      }
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(food.id, quantity);
      showToast("Successfully added to cart!", "green");
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast("Failed to add to cart", "red");
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(parseInt(id));
        setIsFavorite(false);
        showToast("Removed from favorites!", "red");
      } else {
        await addFavorite(parseInt(id));
        setIsFavorite(true);
        showToast("Added to favorites!", "green");
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast("Failed to update favorites", "red");
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  // Not found state
  if (!food) {
    return (
      <section className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">🍽️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Food not found</h2>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-block bg-main-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Back to Menu
          </Link>
        </div>
      </section>
    );
  }

  const totalPrice = quantity * parseFloat(food.price);

  return (
    <section className="flex flex-col justify-center items-center min-h-screen p-6 relative w-full">
      <section className="flex flex-col w-full max-w-4xl">
        {/* Main card */}
        <div className="p-5 flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg w-full relative">

          {/* Favorite Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleFavorite}
            className="absolute top-5 right-5 z-10"
          >
            <Image
              src={isFavorite ? "/heart-filled.png" : "/heart.png"}
              alt="Favorite"
              width={30}
              height={30}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
            />
          </motion.button>

          {/* Food Image */}
          <div className="md:w-1/2">
            <img
              src={food.image_url}
              alt={food.name}
              className="rounded-xl object-cover w-full h-[400px]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center"><span class="text-gray-400 text-6xl">🍽️</span></div>';
                }
              }}
            />
          </div>

          {/* Food Info */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{food.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                  {food.category}
                </span>
              </div>
              
              {food.description && (
                <p className="text-gray-600 mb-4">{food.description}</p>
              )}
              
              <div className="text-2xl font-bold text-main-red mb-2">
                ₱{parseFloat(food.price).toFixed(2)}
              </div>
              
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span>🍴</span> Cananimus Inc.
              </p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-4">
                {/* Quantity Control */}
                <div className="flex items-center border rounded-lg px-3 py-2">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-xl px-2 cursor-pointer"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </motion.button>

                  <motion.span
                    key={quantity}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="px-4 font-medium"
                  >
                    {quantity}
                  </motion.span>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-xl px-2 cursor-pointer"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </motion.button>
                </div>

                <div className="ml-auto font-semibold text-lg">
                  Total: <span className="text-red-500">₱{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="w-full cursor-pointer bg-main-red text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-main-red font-medium transition-all duration-300 group"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            <span className="group-hover:underline">
              Back to Menu
            </span>
          </Link>
        </div>
      </section>
    </section>
  );
}