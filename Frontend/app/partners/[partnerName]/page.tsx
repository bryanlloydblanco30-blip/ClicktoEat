import PartnerDetailClient from './PartnerDetailClient';

// ✅ Generate static paths for all partners at build time
export async function generateStaticParams() {
  // Hardcode your partner names here
  const partners = [
    "Theatery Food Hub", 
    "Potato Corner", 
    "Chowking", 
    "SpotG", 
    "Julies Bake Shop", 
    "Waffle Time", 
    "Takoyaki", 
    "Shawarma", 
    "Buko Bar", 
    "Juice Hub", 
    "Other"
  ];
  
  return partners.map((partner) => ({
    partnerName: encodeURIComponent(partner),
  }));
}

// ✅ Server Component wrapper - FIXED to handle params properly
export default async function PartnerPage({ 
  params 
}: { 
  params: Promise<{ partnerName: string }> | { partnerName: string }
}) {
  // Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  
  // Add validation
  if (!resolvedParams.partnerName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Partner</h1>
          <p className="text-gray-600">Partner name is missing from the URL.</p>
        </div>
      </div>
    );
  }
  
  return <PartnerDetailClient partnerName={resolvedParams.partnerName} />;
}