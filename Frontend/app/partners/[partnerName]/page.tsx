import PartnerDetailClient from './PartnerDetailClient';

// ✅ Generate static paths for all partners at build time
export async function generateStaticParams() {
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
    partnerName: partner, // ❌ DON'T encode here - Next.js does it automatically
  }));
}

// ✅ Server Component wrapper
export default async function PartnerPage({ 
  params 
}: { 
  params: Promise<{ partnerName: string }> | { partnerName: string }
}) {
  // Await params if it's a Promise (Next.js 15+)
  const resolvedParams = await Promise.resolve(params);
  
  console.log('=== DEBUG INFO ===');
  console.log('Resolved params:', resolvedParams);
  console.log('Partner name:', resolvedParams.partnerName);
  console.log('==================');
  
  // Add validation
  if (!resolvedParams.partnerName || resolvedParams.partnerName === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Partner</h1>
          <p className="text-gray-600">Partner name is missing from the URL.</p>
          <p className="text-sm text-gray-400 mt-2">Received: {String(resolvedParams.partnerName)}</p>
        </div>
      </div>
    );
  }
  
  return <PartnerDetailClient partnerName={resolvedParams.partnerName} />;
}