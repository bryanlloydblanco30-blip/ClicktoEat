'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import { getAllMenuItemsAdmin, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';

type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url: string;
  description?: string;
  available?: boolean;
  food_partner?: string;
};

export default function ProductsAdmin() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    // 1. UPDATED STATE to include 'available'
    const [formData, setFormData] = useState({ 
      name: "", 
      price: "", 
      category: "", 
      image_url: "",
      description: "",
      food_partner: "",
      available: true 
    });

    const foodPartners = [
      "Theatery Food Hub", "Potato Corner", "Chowking", "SpotG", 
      "Julies Bake Shop", "Waffle Time", "Takoyaki", "Shawarma", 
      "Buko Bar", "Juice Hub", "Other"
    ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllMenuItemsAdmin();
      if (response.items) {
        setProducts(response.items);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.image_url || !formData.food_partner) {
      alert("Please fill in all required fields (name, price, category, food partner, image).");
      return;
    }

    try {
      if (editingProduct) {
        const response = await updateMenuItem(editingProduct.id, {
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description || '',
          food_partner: formData.food_partner,
          available: formData.available // 2. SEND ACTUAL CHECKBOX VALUE (Was hardcoded true)
        });
        
        if (response.item) {
          alert('Product updated successfully!');
          await loadProducts();
        }
      } else {
        const response = await createMenuItem({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description || '',
          food_partner: formData.food_partner,
          available: formData.available
        });
        
        if (response.item) {
          alert('Product added successfully!');
          await loadProducts();
        }
      }

      setEditingProduct(null);
      setFormData({ name: "", price: "", category: "", image_url: "", description: "", food_partner: "", available: true });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      description: product.description || '',
      food_partner: product.food_partner || '',
      available: product.available ?? true // 3. LOAD CURRENT AVAILABILITY
    });
    
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Are you sure you want to delete this product?")) {
        return;
      }

      try {
        await deleteMenuItem(id);
        alert('Product deleted successfully!');
        await loadProducts();
      } catch (error: any) {
        console.error('Detailed delete error:', error);
        
        // 4. SPECIFIC ERROR HANDLING FOR THE USER
        if (error.message && error.message.includes("Mark as unavailable")) {
           alert("⚠️ CANNOT DELETE: This item has previous orders.\n\nSOLUTION: Click 'Edit' and uncheck the 'Product is Available' box to hide it from the menu instead.");
        } else {
           alert('Failed to delete product. See console for details.');
        }
      }
    };

  const handleUpload = (fileInfo: any) => {
    const url =
      fileInfo?.successEntries?.[0]?.cdnUrl ||
      fileInfo?.allEntries?.[0]?.cdnUrl ||
      fileInfo?.cdnUrl;

    if (url) {
      setFormData({ ...formData, image_url: url });
    }
  };

  if (loading) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <main className="p-4">
      <div className="flex items-center mb-4">
        <Image src="/box.png" height={30} width={30} alt="shopping cart icon" />
        <h1 className="ml-3 text-xl md:text-2xl font-semibold">Products</h1>
      </div>
        
      {/* Form for Add/Edit */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">
          {editingProduct ? "Edit Product" : "Add Product"}
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Product Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full"
          />
          
          <div className="grid grid-cols-2 gap-4">
             <input
                type="number"
                step="0.01"
                placeholder="Price *"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="border p-2 rounded w-full"
              />
              
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Category *</option>
                <option value="Meals">Meals</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
          </div>

          <select
            value={formData.food_partner}
            onChange={(e) => setFormData({ ...formData, food_partner: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Food Partner *</option>
            {foodPartners.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border p-2 rounded w-full"
          />
          
          {/* 5. NEW AVAILABILITY CHECKBOX */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">
            <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="available" className="font-medium text-gray-700 cursor-pointer select-none">
                Product is Available (Show on Menu)
            </label>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Product Image *</label>
            {/* @ts-ignore */}
            {formData.image_url && (
              <img 
                src={formData.image_url} 
                alt="Preview" 
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="cursor-pointer border border-main-red text-main-red px-10 py-2 rounded-lg hover:bg-red-50 transition"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
            
            {editingProduct && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({ name: "", price: "", category: "", image_url: "", description: "", food_partner: "", available: true });
                }}
                className="cursor-pointer border border-gray-400 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Partner</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No products found. Add your first product above!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={`border-b hover:bg-gray-50 ${!product.available ? 'bg-gray-50' : ''}`}>
                  <td className="p-2 w-20">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className={`w-16 h-16 object-cover rounded ${!product.available ? 'opacity-50' : ''}`}
                    />
                  </td>
                  <td className="p-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                  </td>
                  {/* 6. STATUS BADGE */}
                  <td className="p-3">
                    {product.available ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                    ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">Unavailable</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">{product.food_partner || 'N/A'}</td>
                  <td className="p-3">₱{product.price}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="border border-yellow-400 text-yellow-400 px-5 py-1 rounded-full cursor-pointer hover:bg-yellow-500 hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="border border-red-500 text-red-500 px-5 py-1 rounded-full cursor-pointer hover:bg-red-600 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}