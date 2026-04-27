// PRAVAH + LifeLane - Main Application Entry
// Multi-Service Smart City Platform

export default function HomePage() {
  // Redirect to login page - permanent routing
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">PRAVAH + LifeLane</h1>
        <p className="text-gray-300 mb-8">Multi-Service Smart City Platform</p>
        <a 
          href="/login" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Get Started
        </a>
        <div className="mt-8 text-gray-400">
          <p className="text-sm">Permanent URLs Available:</p>
          <div className="mt-2 space-y-1">
            <p><span className="text-purple-400">/emergency</span> - Emergency Services</p>
            <p><span className="text-purple-400">/admin</span> - System Admin</p>
            <p><span className="text-purple-400">/driver</span> - Service Provider</p>
            <p><span className="text-purple-400">/child</span> - Child Safety</p>
            <p><span className="text-purple-400">/parent</span> - Parental Monitoring</p>
            <p><span className="text-purple-400">/eldercare</span> - Elderly Care</p>
            <p><span className="text-purple-400">/womensafety</span> - Women Safety</p>
            <p><span className="text-purple-400">/parcel</span> - Parcel Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
