import PartnerDetailClient from './PartnerDetailClient';

// ✅ Generate static paths for all partners at build time
export async function generateStaticParams() {
  // Hardcode your partner names here
  // Add all your actual partner names to this array
  const partners = [
      "Theatery Food Hub", "Potato Corner", "Chowking", "SpotG", 
      "Julies Bake Shop", "Waffle Time", "Takoyaki", "Shawarma", 
      "Buko Bar", "Juice Hub", "Other"
  ];
  
  return partners.map((partner) => ({
    partnerName: encodeURIComponent(partner),
  }));
}

// ✅ Server Component wrapper
export default function PartnerPage({ params }: { params: { partnerName: string } }) {
  return <PartnerDetailClient partnerName={params.partnerName} />;
}