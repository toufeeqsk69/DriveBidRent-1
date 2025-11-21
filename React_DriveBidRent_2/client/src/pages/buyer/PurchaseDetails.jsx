import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPurchaseDetails } from '../../services/buyer.services';

export default function PurchaseDetails() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        const data = await getPurchaseDetails(id);
        setPurchase(data);
      } catch (error) {
        console.error('Error fetching purchase details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-2xl font-semibold text-gray-700">Loading purchase details...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center max-w-md">
          <h2 className="text-3xl font-bold text-orange-500 mb-3">Purchase not found</h2>
          <p className="text-gray-600 mb-6">We couldn’t locate the purchase you’re looking for.</p>
          <Link
            to="/buyer/purchases"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            Go to My Purchases
          </Link>
        </div>
      </div>
    );
  }

  const {
    vehicleImage,
    vehicleName,
    purchaseDate,
    year,
    mileage,
    purchasePrice,
    paymentStatus,
    auctionId,
    sellerId,
    sellerName
  } = purchase;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative h-80 bg-cover bg-center flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: "url('/images/car1003.png')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-6">
          <p className="uppercase tracking-[0.4em] text-sm text-gray-200">Purchase Summary</p>
          <h1 className="text-5xl md:text-6xl font-black mt-4">
            {vehicleName}
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            Purchased on {new Date(purchaseDate).toLocaleDateString()}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <Link
            to="/buyer/purchases"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow-lg"
          >
            ← Back to My Purchases
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-semibold">
              Status: {paymentStatus?.charAt(0)?.toUpperCase() + paymentStatus?.slice(1)}
            </span>
            {auctionId?.condition && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-semibold">
                Condition: {auctionId.condition.charAt(0).toUpperCase() + auctionId.condition.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Vehicle Card */}
          <div className="bg-white border border-orange-100 rounded-3xl shadow-xl overflow-hidden">
            <div className="relative">
              <img
                src={vehicleImage}
                alt={vehicleName}
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-5 left-5 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ₹{purchasePrice?.toLocaleString()}
              </div>
            </div>

            <div className="p-8 space-y-4">
              <h2 className="text-3xl font-extrabold text-gray-900">{vehicleName}</h2>
              <p className="text-gray-600">Owned since {new Date(purchaseDate).toLocaleDateString()}</p>

              <div className="grid grid-cols-2 gap-6 mt-6 text-sm text-gray-600">
                <div>
                  <p className="uppercase tracking-wide text-xs text-gray-400 mb-1">Year</p>
                  <p className="text-lg font-semibold text-gray-900">{year}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-gray-400 mb-1">Mileage</p>
                  <p className="text-lg font-semibold text-gray-900">{mileage?.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-gray-400 mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {auctionId?.fuelType ? auctionId.fuelType.charAt(0).toUpperCase() + auctionId.fuelType.slice(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-gray-400 mb-1">Transmission</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {auctionId?.transmission ? auctionId.transmission.charAt(0).toUpperCase() + auctionId.transmission.slice(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller / Contact */}
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl shadow-xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Seller Information</h3>
              <div className="space-y-4 text-gray-700">
                <p><span className="font-semibold text-gray-900">Seller:</span> {sellerName}</p>
                <p><span className="font-semibold text-gray-900">Email:</span> {sellerId?.email || 'Not available'}</p>
                <p><span className="font-semibold text-gray-900">Phone:</span> {sellerId?.phone || 'Not available'}</p>
                <p>
                  <span className="font-semibold text-gray-900">Location:</span>{' '}
                  {sellerId?.city && sellerId?.state ? `${sellerId.city}, ${sellerId.state}` : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <p className="text-gray-500 text-sm mb-3">Need help with this purchase?</p>
              <a
                href={`mailto:${sellerId?.email || ''}?subject=Regarding ${vehicleName}`}
                className="inline-flex items-center justify-center w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg"
              >
                Contact Seller
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/buyer/purchases"
            className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition"
          >
            ← Back to My Purchases
          </Link>
        </div>
      </section>
    </div>
  );
}