'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getFoodPartners } from "../services/api";

interface FoodPartner {
  name: string;
  image_url: string;
  item_count: number;
}

export default function FoodPartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<FoodPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const data = await getFoodPartners();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Error loading food partners:', error);
      alert('Failed to load food partners');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerClick = (partnerName: string) => {
    // THIS IS HOW YOU NAVIGATE TO THE PARTNER DETAIL PAGE
    router.push(`/partners/${encodeURIComponent(partnerName)}`);
  };

  if (loading) {
    return (
      <main className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading partners...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900">Food Partners</h1>
        </div>
        <p className="text-gray-600">Browse our amazing restaurant partners</p>
      </div>

      {partners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              onClick={() => router.push(`/partners/${encodeURIComponent(partner.name)}`)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {partner.image_url ? (
                  <Image
                    src={partner.image_url}
                    alt={partner.name}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-xl text-gray-800 mb-2">{partner.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {partner.item_count} {partner.item_count === 1 ? 'item' : 'items'}
                  </p>
                  <svg className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-lg">No food partners available yet.</p>
        </div>
      )}
    </main>
  );
}