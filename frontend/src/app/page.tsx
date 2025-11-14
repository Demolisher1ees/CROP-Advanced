'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  })
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predict/crop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          ph: parseFloat(formData.ph),
          rainfall: parseFloat(formData.rainfall),
          nitrogen: parseFloat(formData.nitrogen),
          phosphorus: parseFloat(formData.phosphorus),
          potassium: parseFloat(formData.potassium),
        }),
      })

      const data = await response.json()
      setPredictions(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-800">
          🌾 Smart Crop Advisor
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Enter Field Parameters
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Humidity (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soil pH
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rainfall (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.rainfall}
                onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nitrogen (N)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.nitrogen}
                onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phosphorus (P)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.phosphorus}
                onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potassium (K)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.potassium}
                onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Analyzing...' : 'Get Crop Recommendations'}
              </button>
            </div>
          </form>
        </div>

        {predictions && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Recommended Crops
            </h2>
            <div className="space-y-4">
              {predictions.recommendations.map((crop: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-green-700">
                        {crop.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Season: {crop.season} | Duration: {crop.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {crop.score.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Suitability</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Confidence:</strong> {predictions.confidence}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
