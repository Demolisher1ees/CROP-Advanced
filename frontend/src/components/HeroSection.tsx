export function HeroSection() {
  return (
    <section className="relative min-h-[600px] flex items-center bg-cover bg-center" style={{
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80')"
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Smart Farming Starts with the Right Crop
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Get personalized crop recommendations based on soil conditions, climate data, and market trends. 
            Make informed decisions and maximize your harvest potential.
          </p>
        </div>

        {/* Crop Recommendations Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900">Get Crop Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left text-gray-700 hover:border-green-600 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Detect Location
              </button>
            </div>

            {/* Crop Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Select Crop
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Choose a crop</option>
                <option>Bajra (Pearl Millet)</option>
                <option>Barley</option>
                <option>Black Gram (Urad)</option>
                <option>Chickpea (Chana)</option>
                <option>Coconut</option>
                <option>Coffee</option>
                <option>Corn (Maize)</option>
                <option>Cotton</option>
                <option>Groundnut (Peanut)</option>
                <option>Jowar (Sorghum)</option>
                <option>Jute</option>
                <option>Lentil (Masoor)</option>
                <option>Millet</option>
                <option>Mustard</option>
                <option>Onion</option>
                <option>Pigeon Pea (Arhar/Tur)</option>
                <option>Potato</option>
                <option>Ragi (Finger Millet)</option>
                <option>Rice (Paddy)</option>
                <option>Sesame</option>
                <option>Soybean</option>
                <option>Sugarcane</option>
                <option>Sunflower</option>
                <option>Tea</option>
                <option>Tomato</option>
                <option>Wheat</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Get Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg">
        <span className="text-xl">?</span>
      </button>
    </section>
  )
}
