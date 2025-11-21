import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  async function fetchWishlist() {
    try {
      const data = await getWishlist();
      setWishlist({ auctions: data.auctions || [], rentals: data.rentals || [] });
    } catch (e) {
      console.error('fetchWishlist error', e);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlistHandler(id, type) {
    try {
      await removeFromWishlist(id, type);
      setWishlist(prev => ({
        auctions: type === 'auction' ? prev.auctions.filter(a => (a._id || a.id) !== id) : prev.auctions,
        rentals: type === 'rental' ? prev.rentals.filter(r => (r._id || r.id) !== id) : prev.rentals
      }));
    } catch (e) {
      console.error('removeFromWishlist error', e);
      alert('Failed to remove item.');
    }
  }

  function isAuctionEnded(auction) {
    if (!auction) return false;
    if (auction.started_auction === 'ended') return true;
    if (auction.auction_stopped === true) return true;
    const endDate = auction.endDate || auction.auctionEnd || auction.auction_end;
    if (endDate) {
      const d = new Date(endDate);
      if (!isNaN(d) && d.getTime() < Date.now()) return true;
    }
    return false;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-3xl font-bold text-orange-500">Loading your wishlist...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-72 md:h-80 lg:h-96 bg-cover bg-center text-white" style={{ backgroundImage: "url('/images/wishlist-hero.jpg')", backgroundColor: '#403a2e' }}>
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 px-6 text-center flex items-center justify-center h-full">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight break-words">Your <span className="text-orange-500 font-black">Wishlist</span></h1>
            <p className="mt-3 text-lg md:text-xl font-medium text-gray-100">All your favorite auctions and rentals in one place.</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-orange-500 mb-8 text-left">Wishlist - Auctions</h2>

        {wishlist.auctions.length === 0 ? (
          <p className="text-center text-xl text-gray-600 py-10">No auctions in your wishlist yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.auctions.map((auction, idx) => {
              const id = auction?._id || auction?.id || `auction-${idx}`;
              const ended = isAuctionEnded(auction);
              const auctionDateObj = auction?.auctionDate ? new Date(auction.auctionDate) : null;
              const currentPrice = Number(auction?.currentHighestBid ?? auction?.startingBid ?? 0);
              const finalPrice = auction?.finalPurchasePrice ?? null;

              return (
                <div key={id} className="relative bg-white border border-orange-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 flex flex-col">
                  <button onClick={() => removeFromWishlistHandler(id, 'auction')} className="absolute top-4 right-4 z-10 text-3xl text-orange-500 hover:text-red-600 transition" aria-label="Remove from wishlist">♥</button>

                  {ended && (
                    <span className="absolute top-4 left-4 z-10 bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md">Auction Ended</span>
                  )}

                  <img src={auction?.vehicleImage || '/images/default-car.png'} alt={auction?.vehicleName || 'Vehicle Image'} className="w-full h-48 object-cover" />

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-orange-500 mb-3">{auction?.vehicleName || 'Untitled'}</h3>

                    <p className="text-gray-600 text-sm mb-4">Auction Date: <strong>{auctionDateObj && !isNaN(auctionDateObj) ? auctionDateObj.toLocaleDateString() : 'Unknown'}</strong></p>

                    <div className="bg-gray-50 p-5 rounded-lg space-y-2 text-sm flex-grow">
                      <p><strong>Year:</strong> {auction?.year ?? '—'}</p>
                      <p><strong>Mileage:</strong> {auction?.mileage != null ? `${auction.mileage.toLocaleString()} km` : '—'}</p>
                      <p><strong>Condition:</strong> {auction?.condition ? (auction.condition.charAt(0).toUpperCase() + auction.condition.slice(1)) : '—'}</p>
                      <p><strong>Starting Price:</strong> ₹{auction?.startingBid != null ? auction.startingBid.toLocaleString() : '—'}</p>
                      {auction?.sellerId && (<p><strong>Seller:</strong> {auction.sellerId.firstName} {auction.sellerId.lastName}</p>)}
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-300">
                      <p className="text-sm font-semibold text-orange-700">{ended ? 'Final Price' : 'Current Highest Bid'}</p>
                      <p className="text-2xl font-black text-orange-600">₹{(ended && finalPrice ? Number(finalPrice) : currentPrice).toLocaleString()}</p>
                    </div>

                    <div className="mt-6">
                      {!ended && (
                        <Link to={`/buyer/auctions/${id}`} className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md">More Details</Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-orange-500 mb-8 text-left">Wishlist - Rentals</h2>

          {wishlist.rentals.length === 0 ? (
            <p className="text-center text-xl text-gray-600 py-10">No rentals in your wishlist yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.rentals.map((rental, idx) => {
                const id = rental?._id || rental?.id || `rental-${idx}`;
                return (
                  <div key={id} className="bg-white border border-orange-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 flex flex-col">
                    <button onClick={() => removeFromWishlistHandler(id, 'rental')} className="absolute top-4 right-4 z-10 text-3xl text-orange-500 hover:text-red-600 transition" aria-label="Remove from wishlist">♥</button>

                    <img src={rental?.vehicleImage || '/images/default-car.png'} alt={rental?.vehicleName || 'Vehicle Image'} className="w-full h-48 object-cover" />

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-orange-500 mb-3">{rental?.vehicleName || 'Untitled'}</h3>
                      <p className="text-gray-600 text-sm mb-4">Cost/day: <strong>₹{rental?.costPerDay ?? '—'}</strong></p>

                      <div className="bg-gray-50 p-5 rounded-lg space-y-2 text-sm flex-grow">
                        {rental?.sellerId?.city && (<p><strong>City:</strong> {rental.sellerId.city}</p>)}
                        <p><strong>Year:</strong> {rental?.year ?? '—'}</p>
                        <p><strong>AC:</strong> {rental?.AC === 'available' ? 'Yes' : 'No'}</p>
                        <p><strong>Capacity:</strong> {rental?.capacity ?? '—'} passengers</p>
                        <p><strong>Driver:</strong> {rental?.driverAvailable ? 'Yes' : 'No'}</p>
                        {rental?.sellerId && (<p><strong>Seller:</strong> {rental.sellerId.firstName} {rental.sellerId.lastName}</p>)}
                      </div>

                      <div className="mt-6 space-y-3">
                        <Link
                          to={`/buyer/rentals/${id}`}
                          state={{ from: '/buyer/wishlist' }}
                          className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-medium hover:bg-orange-600 transition shadow-md"
                        >
                          More Details
                        </Link>
                        <Link
                          to={`/buyer/rentals/${id}`}
                          state={{ from: '/buyer/wishlist', openRentModal: true }}
                          className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md"
                        >
                          Rent It
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}