// client/src/pages/buyer/RentalsList.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from './components/CarCard';
import { getRentals, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function RentalsList() {
  const [rentals, setRentals] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL
  const searchQuery = searchParams.get('search') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const capacity = searchParams.get('capacity') || '';
  const city = searchParams.get('city') || '';

  // Debounce for real-time search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRentals();
    fetchWishlist();
  }, [debouncedSearch, fuelType, transmission, capacity, city]);

  const fetchRentals = async () => {
    try {
      const filters = {
        search: debouncedSearch,
        fuelType,
        transmission,
        capacity: capacity ? Number(capacity) : undefined,
        city
      };

      const data = await getRentals(filters);
      setRentals(data.rentals || []);
      setUniqueCities(data.uniqueCities || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist({
        auctions: data.auctions || [],
        rentals: data.rentals || []
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (id, type) => {
    try {
      const isInWishlist = wishlist.rentals?.some(item => item._id === id);
      if (isInWishlist) {
        await removeFromWishlist(id, type);
      } else {
        await addToWishlist(id, type);
      }
      fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-3xl font-bold text-orange-500 animate-pulse">Loading rentals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section
        className="relative h-96 md:h-[400px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: "url('/images/rentals-hero.jpg')", backgroundColor: '#1a1a1a' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-orange-500">Rent</span> Your Ride
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-medium text-gray-200">
            Choose from premium vehicles available for rent across cities
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      {/* Filters + Results */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">Filter Rentals</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Vehicle</label>
                  <input
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="e.g. Toyota Innova"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={fuelType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Types</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
                  <select
                    name="transmission"
                    value={transmission}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Types</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={capacity}
                    onChange={handleInputChange}
                    placeholder="e.g. 4"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <select
                    name="city"
                    value={city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(cityOption => (
                      <option key={cityOption} value={cityOption}>
                        {cityOption}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Rentals Grid */}
          <div className="lg:col-span-3">
            <div className="mb-8 flex justify-between items-center">
              <p className="text-xl font-semibold text-gray-700">
                {rentals.length} {rentals.length === 1 ? 'vehicle' : 'vehicles'} available
              </p>
            </div>

            {rentals.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <p className="text-2xl text-gray-600 mb-6">No rentals found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg"
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {rentals.map(rental => (
                  <CarCard
                    key={rental._id}
                    item={rental}
                    type="rental"
                    returnPath="/buyer/rentals"
                    isInWishlist={wishlist.rentals?.some(item => item._id === rental._id)}
                    onToggleWishlist={() => toggleWishlist(rental._id, 'rental')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}