// client/src/pages/buyer/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardData,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUnreadNotificationCount,
} from "../../services/buyer.services";
import CarCard from "./components/CarCard";

const Dashboard = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [featuredRentals, setFeaturedRentals] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dash, wl, count] = await Promise.all([
          getDashboardData(),
          getWishlist(),
          getUnreadNotificationCount(),
        ]);

        setFeaturedAuctions(dash.featuredAuctions || []);
        setFeaturedRentals(dash.featuredRentals || []);

        const auctionIds = (wl.auctions || []).map(a => a._id || a);
        const rentalIds = (wl.rentals || []).map(r => r._id || r);
        setWishlist({ auctions: auctionIds, rentals: rentalIds });
      } catch (err) {
        console.error("Dashboard failed to load:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleWishlistToggle = async (id, type) => {
    const key = type === "auction" ? "auctions" : "rentals";
    const isLiked = wishlist[key].includes(id);

    try {
      if (isLiked) {
        await removeFromWishlist(id, type);
        setWishlist(prev => ({
          ...prev,
          [key]: prev[key].filter(x => x !== id)
        }));
      } else {
        await addToWishlist(id, type);
        setWishlist(prev => ({
          ...prev,
          [key]: [...prev[key], id]
        }));
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-orange-500">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section
        className="relative h-96 md:h-[400px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: "url('/images/car1001.png')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-orange-500">D</span>rive
            <span className="text-orange-500">B</span>id
            <span className="text-orange-500">R</span>ent
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-medium text-gray-100">
            Buy or Rent — Drive Your Dream with{" "}
            <span className="text-orange-500 font-bold">Ease!</span>
          </p>
        </div>
        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      {/* Featured Auctions */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-12">Featured Auctions</h2>

        {featuredAuctions.length === 0 ? (
          <p className="text-center text-xl text-gray-600">No auctions available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAuctions.map((auction) => (
              <CarCard
                key={auction._id}
                item={auction}
                type="auction"
                isInWishlist={wishlist.auctions.includes(auction._id)}
                onToggleWishlist={() => handleWishlistToggle(auction._id, "auction")}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/buyer/auctions"
            className="inline-block bg-orange-500 text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-orange-600 transition"
          >
            More Auctions
          </Link>
        </div>
      </section>

      {/* Featured Rentals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-orange-500 mb-12">Featured Rentals</h2>

          {featuredRentals.length === 0 ? (
            <p className="text-center text-xl text-gray-600">No rentals available right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRentals.slice(0, 3).map((rental) => (
                <CarCard
                  key={rental._id}
                  item={rental}
                  type="rental"
                  returnPath="/buyer"
                  isInWishlist={wishlist.rentals.includes(rental._id)}
                  onToggleWishlist={() => handleWishlistToggle(rental._id, "rental")}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/buyer/rentals"
              className="inline-block bg-orange-500 text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-orange-600 transition"
            >
              More Rentals
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;