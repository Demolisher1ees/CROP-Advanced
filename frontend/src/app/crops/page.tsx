"use client"

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Plus, Search, Droplets, Thermometer, AlertTriangle, CheckCircle, Clock, MapPin, X, Leaf, TrendingUp, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Crop {
  id: number;
  crop_name: string;
  location: string;
  temperature?: number;
  soil_moisture?: string;
  status: string;
  risk_level: string;
  last_checked: string;
  latitude?: number;
  longitude?: number;
}

interface CropDetails extends Crop {
  weather?: {
    temperature: number;
    humidity: number;
    rain_forecast: string;
  };
  soil?: {
    moisture: string;
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  ai_recommendation?: {
    water_needed: boolean;
    fertilizer_needed: boolean;
    shade_needed: boolean;
    notes: string;
  };
}

const CropsPage = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newCrop, setNewCrop] = useState({
    crop_name: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    filterCrops();
  }, [searchQuery, filterStatus, crops]);

  const fetchCrops = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/api/crops");
      if (response.ok) {
        const data = await response.json();
        setCrops(data);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCrops = () => {
    let filtered = crops;

    if (searchQuery) {
      filtered = filtered.filter(
        (crop) =>
          crop.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crop.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((crop) => crop.risk_level.toLowerCase() === filterStatus);
    }

    setFilteredCrops(filtered);
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/crops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop_name: newCrop.crop_name,
          location: newCrop.location,
          latitude: newCrop.latitude ? parseFloat(newCrop.latitude) : null,
          longitude: newCrop.longitude ? parseFloat(newCrop.longitude) : null,
        }),
      });

      if (response.ok) {
        setIsAddModalOpen(false);
        setNewCrop({ crop_name: "", location: "", latitude: "", longitude: "" });
        fetchCrops();
      }
    } catch (error) {
      console.error("Error adding crop:", error);
    }
  };

  const handleViewDetails = async (cropId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/crops/${cropId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCrop(data);
        setIsDetailsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching crop details:", error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
      case "healthy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high":
      case "action required":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low":
      case "healthy":
        return <CheckCircle size={20} />;
      case "medium":
      case "warning":
        return <AlertTriangle size={20} />;
      case "high":
      case "action required":
        return <AlertTriangle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-green-600 py-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-20 text-white">
              <Leaf size={100} />
            </div>
            <div className="absolute bottom-10 right-20 text-white">
              <TrendingUp size={120} />
            </div>
          </div>
          
          <div className="container relative mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-3 md:text-5xl">
                  My Crops
                </h1>
                <p className="text-xl text-green-50">
                  Monitor crop health, soil, and AI recommendations in real time
                </p>
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="lg"
                className="gap-2 bg-white text-green-700 hover:bg-green-50 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Plus size={20} />
                Add New Crop
              </Button>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b border-green-100">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by crop name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    filterStatus === "all"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("healthy")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    filterStatus === "healthy"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Healthy
                </button>
                <button
                  onClick={() => setFilterStatus("warning")}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    filterStatus === "warning"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Warning
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Crops Grid */}
        <section className="py-12">
          <div className="container mx-auto max-w-7xl px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCrops.length === 0 ? (
              <div className="text-center py-20">
                <Leaf className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No crops found</h3>
                <p className="text-gray-600 mb-6">Start by adding your first crop to monitor</p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus size={20} />
                  Add New Crop
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCrops.map((crop) => (
                  <Card
                    key={crop.id}
                    className="bg-white border-2 border-green-100 shadow-lg rounded-2xl hover:shadow-xl hover:border-green-300 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-900 mb-2">{crop.crop_name}</CardTitle>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin size={16} />
                            <span>{crop.location}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${getRiskColor(crop.risk_level)}`}>
                          {getRiskIcon(crop.risk_level)}
                          <span>{crop.risk_level}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Thermometer className="text-orange-600" size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Temperature</p>
                            <p className="font-semibold text-gray-900">{crop.temperature || "N/A"}°C</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Droplets className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Soil Moisture</p>
                            <p className="font-semibold text-gray-900">{crop.soil_moisture || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-900 mb-1">AI Recommendation</p>
                        <p className="text-sm text-green-700">{crop.status}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={14} />
                          <span>{new Date(crop.last_checked).toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewDetails(crop.id)}
                        className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Add Crop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Crop</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddCrop} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCrop.crop_name}
                  onChange={(e) => setNewCrop({ ...newCrop, crop_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Rice, Wheat, Corn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={newCrop.location}
                  onChange={(e) => setNewCrop({ ...newCrop, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="e.g., Kolkata, West Bengal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newCrop.latitude}
                    onChange={(e) => setNewCrop({ ...newCrop, latitude: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="22.5726"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newCrop.longitude}
                    onChange={(e) => setNewCrop({ ...newCrop, longitude: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="88.3639"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  Add Crop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCrop.crop_name}</h2>
                  <p className="text-green-100 flex items-center gap-2 mt-1">
                    <MapPin size={16} />
                    {selectedCrop.location}
                  </p>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Weather Section */}
              {selectedCrop.weather && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Wind className="text-blue-600" size={24} />
                    Weather Conditions
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-2 border-blue-100">
                      <CardContent className="p-4 text-center">
                        <Thermometer className="mx-auto mb-2 text-orange-600" size={32} />
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedCrop.weather.temperature}°C</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-blue-100">
                      <CardContent className="p-4 text-center">
                        <Droplets className="mx-auto mb-2 text-blue-600" size={32} />
                        <p className="text-sm text-gray-600">Humidity</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedCrop.weather.humidity}%</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-blue-100">
                      <CardContent className="p-4 text-center">
                        <Wind className="mx-auto mb-2 text-gray-600" size={32} />
                        <p className="text-sm text-gray-600">Rain Forecast</p>
                        <p className="text-lg font-bold text-gray-900">{selectedCrop.weather.rain_forecast}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Soil Section */}
              {selectedCrop.soil && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Leaf className="text-green-600" size={24} />
                    Soil Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-green-100">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Moisture</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.soil.moisture}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-100">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">pH Level</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.soil.ph}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-100">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Nitrogen (N)</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.soil.nitrogen} kg/ha</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-100">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Phosphorus (P)</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.soil.phosphorus} kg/ha</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-100">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">Potassium (K)</p>
                        <p className="text-xl font-bold text-gray-900">{selectedCrop.soil.potassium} kg/ha</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {selectedCrop.ai_recommendation && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-purple-600" size={24} />
                    AI Recommendations
                  </h3>
                  <Card className="border-2 border-purple-100 bg-purple-50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedCrop.ai_recommendation.water_needed ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Droplets className={selectedCrop.ai_recommendation.water_needed ? "text-blue-600" : "text-gray-400"} size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Water Needed</p>
                          <p className="text-sm text-gray-600">{selectedCrop.ai_recommendation.water_needed ? "Yes - Irrigation recommended" : "No - Adequate moisture"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedCrop.ai_recommendation.fertilizer_needed ? "bg-green-100" : "bg-gray-100"}`}>
                          <Leaf className={selectedCrop.ai_recommendation.fertilizer_needed ? "text-green-600" : "text-gray-400"} size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Fertilizer Needed</p>
                          <p className="text-sm text-gray-600">{selectedCrop.ai_recommendation.fertilizer_needed ? "Yes - Apply NPK fertilizer" : "No - Nutrient levels adequate"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedCrop.ai_recommendation.shade_needed ? "bg-yellow-100" : "bg-gray-100"}`}>
                          <AlertTriangle className={selectedCrop.ai_recommendation.shade_needed ? "text-yellow-600" : "text-gray-400"} size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Shade Needed</p>
                          <p className="text-sm text-gray-600">{selectedCrop.ai_recommendation.shade_needed ? "Yes - Protect from heat" : "No - Temperature optimal"}</p>
                        </div>
                      </div>
                      {selectedCrop.ai_recommendation.notes && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                          <p className="text-sm font-medium text-gray-900 mb-2">Additional Notes:</p>
                          <p className="text-sm text-gray-700">{selectedCrop.ai_recommendation.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropsPage;
