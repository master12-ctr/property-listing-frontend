import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Find Your Perfect Property
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Discover amazing properties for rent or sale. Join our multi-tenant platform and start listing or finding properties today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/properties" 
            className="btn-primary px-8 py-3 text-lg font-semibold"
          >
            Browse Properties
          </Link>
          <Link 
            href="/register" 
            className="btn-secondary px-8 py-3 text-lg font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}