'use client'
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link";
import { getFavorites, removeFavorite } from "../services/api";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
};

export default function Favorites(){
    const [search, setSearch] = useState("");
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await getFavorites();
            
            if (response.favorites) {
                const items = response.favorites.map((fav: any) => fav.menu_item);
                setMenuItems(items);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFoods = menuItems.filter((food) => {
        const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || food.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];

    const handleRemoveFavorite = async (id: number) => {
        try {
            await removeFavorite(id);
            setMenuItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    if (loading) {
        return (
            <main className="p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-red mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading favorites...</p>
                </div>
            </main>
        );
    }

    return(
        <main className="p-6">
            <div className="flex items-center mb-6">
                <Image src="/heart.png" height={30} width={30} alt="favorites icon" />
                <h1 className="ml-3 text-xl md:text-2xl font-semibold">Favorites</h1>
            </div>

            <section className="flex flex-col md:flex-row justify-between items-center py-5 gap-4">
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

                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search favorites..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 text-gray-800 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-red"
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
                {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                        <div key={food.id} className="relative">
                            <Link href={`/chosen_food/${food.id}`}>
                                <div className="relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-white hover:shadow-2xl transition-shadow duration-300">
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
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                                        
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition duration-500 z-10">
                                            <span className="text-2xl text-center px-4">{food.name}</span>
                                            <span className="text-lg text-main-red mt-2">₱{parseFloat(food.price).toFixed(2)}</span>
                                        </div>
                                    </div>

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
                            
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveFavorite(food.id);
                                }}
                                className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                                title="Remove from favorites"
                            >
                                <svg className="w-6 h-6 text-main-red" fill="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No favorite items yet.</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {search ? "Try adjusting your search" : "Start adding items to your favorites!"}
                        </p>
                        <Link href="/" className="inline-block mt-4 px-6 py-2 bg-main-red text-white rounded-full hover:bg-red-600 transition">
                            Browse Menu
                        </Link>
                    </div>
                )}
            </div>

            {filteredFoods.length > 0 && (
                <div className="text-center mt-8 text-gray-600">
                    {filteredFoods.length} favorite {filteredFoods.length === 1 ? 'item' : 'items'}
                </div>
            )}
        </main>
    )
}