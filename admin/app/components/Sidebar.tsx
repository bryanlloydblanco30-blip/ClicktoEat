"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('user');
    localStorage.removeItem('cart_session_id');
    localStorage.removeItem('session_id');
    
    // Redirect and replace history to prevent back button
    window.location.replace('https://clicktoeat-frontend.onrender.com/login');
  };

  const menuItems = [
    { name: "Dashboard", icon: "/grid.png", href: "/" },
    { name: "Products", icon: "/shopping-cart.png", href: "/products" },
    { name: "Orders", icon: "/history.png", href: "/orders" },
    { name: "Categories", icon: "/fork.png", href: "/categories" },
  ];

  return (
    <aside className="pt-3 shadow-md sticky top-0 h-screen bg-white min-w-[240px]">
      <div className="flex items-center p-5">
        <Link href="/">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={150} 
            height={30}
            priority
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<h2 class="text-2xl font-bold text-red-600">🍔 Admin</h2>';
            }}
          />
        </Link>
      </div>

      <div className="px-5 mb-4">
        <span className="text-xs text-gray-500 uppercase font-semibold">Admin Panel</span>
      </div>

      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-10 py-4 cursor-pointer transition ${
              isActive
                ? "bg-red-100 border-l-4 border-red-600 text-red-600 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Image 
              src={item.icon} 
              width={20} 
              height={20} 
              alt={item.name}
              onError={(e) => {
                // Fallback to emoji if image doesn't exist
                const emojis: {[key: string]: string} = {
                  '/grid.png': '📊',
                  '/shopping-cart.png': '🍕',
                  '/history.png': '📦',
                  '/fork.png': '🍽️'
                };
                e.currentTarget.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = emojis[item.icon] || '📌';
                span.className = 'text-xl';
                e.currentTarget.parentElement!.insertBefore(span, e.currentTarget.parentElement!.firstChild);
              }}
            />
            <h3 className="ml-3">{item.name}</h3>
          </Link>
        );
      })}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex items-center px-10 py-4 cursor-pointer transition hover:bg-gray-100 w-full text-left text-gray-700"
      >
        <Image 
          src="/logout.png" 
          width={20} 
          height={20} 
          alt="Logout"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const span = document.createElement('span');
            span.textContent = '🚪';
            span.className = 'text-xl';
            e.currentTarget.parentElement!.insertBefore(span, e.currentTarget.parentElement!.firstChild);
          }}
        />
        <h3 className="ml-3">Logout</h3>
      </button>
    </aside>
  );
}