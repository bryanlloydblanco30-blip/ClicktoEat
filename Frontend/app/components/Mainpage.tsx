'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getMenuItems, getFavoriteIds, addFavorite, removeFavorite } from "../services/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
};

export default function Mainpage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch menu items and favorites on component mount
  useEffect(() => {
    loadMenuItems();
    loadFavorites();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems();
      if (response.items) {
        setMenuItems(response.items);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await getFavoriteIds();
      if (response.favorite_ids) {
        setFavorites(response.favorite_ids);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Toggle favorite function
  const toggleFavorite = async (id: number) => {
    try {
      if (favorites.includes(id)) {
        await removeFavorite(id);
        setFavorites(favorites.filter(fav => fav !== id));
      } else {
        await addFavorite(id);
        setFavorites([...favorites, id]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Filter by search and category
  const filteredFoods = menuItems.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Image src="/shopping-bag.png" height={30} width={30} alt="shopping bag" />
        <h1 className="ml-3 text-xl font-semibold">Order Now!</h1>
      </div>

      {/* Categories + Search Bar */}
      <section className="flex flex-col md:flex-row justify-between items-center py-5 gap-4">
        {/* Categories */}
        <div className="flex text-gray-700 flex-wrap gap-2">
          {categories.map((category) => (
            <h3
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 cursor-pointer rounded-full transition ${
                activeCategory === category
                  ? "bg-main-red text-white"
                  : "hover:bg-gray-100 hover:text-main-red"
              }`}
            >
              {category}
            </h3>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 text-gray-800 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-red"
          />
        </div>
      </section>

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <div key={food.id} className="relative">
              <Link href={`/chosen_food/${food.id}`}>
                <div className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-white hover:shadow-2xl transition-shadow duration-300">
                  {/* Food Image */}
                  <div className="relative w-full h-64">
                    <img
                      src={food.image_url}
                      alt={food.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-400 text-4xl">🍽️</span></div>';
                        }
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                    
                    {/* Hover Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition duration-500 z-10">
                      <span className="text-2xl text-center px-4">{food.name}</span>
                      <span className="text-lg text-main-red mt-2">₱{parseFloat(food.price).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Info Section (Always Visible) */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">{food.name}</h3>
                    {food.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{food.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-main-red font-bold text-lg">₱{parseFloat(food.price).toFixed(2)}</span>
                      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                        {food.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Favorite Heart Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(food.id);
                }}
                className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                title={favorites.includes(food.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <svg 
                  className={`w-6 h-6 transition ${favorites.includes(food.id) ? 'text-main-red' : 'text-gray-400'}`} 
                  fill={favorites.includes(food.id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No food found.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredFoods.length > 0 && (
        <div className="text-center mt-8 text-gray-600">
          Showing {filteredFoods.length} of {menuItems.length} items
        </div>
      )}
    </section>
  );
}