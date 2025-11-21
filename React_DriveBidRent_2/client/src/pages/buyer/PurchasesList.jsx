// client/src/pages/buyer/PurchasesList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getPurchases,
  getAuctionPaymentDetails,
  completeAuctionPayment
} from '../../services/buyer.services';
import PaymentModal from './components/modals/PaymentModal';

export default function PurchasesList() {
  const [auctionPurchases, setAuctionPurchases] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const data = await getPurchases();
      setAuctionPurchases(data.auctionPurchases || []);
      setRentals(data.rentals || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (purchase) => {
    try {
      const details = await getAuctionPaymentDetails(purchase.auctionId);
      setPaymentDetails(details);
      setSelectedPurchase(purchase);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Failed to load payment details');
    }
  };

  const handlePayment = async (paymentMethod) => {
    try {
      const result = await completeAuctionPayment(selectedPurchase._id, paymentMethod);
      if (result.success) {
        alert('Payment successful! Contact the seller.');
        setShowPaymentModal(false);
        fetchPurchases();
      } else {
        alert(result.message || 'Payment failed');
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-3xl font-bold text-orange-500">Loading purchases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section
        className="relative h-96 md:h-[400px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: "url('/images/car1002.png')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            My <span className="text-orange-500 font-black">Purchases</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl font-medium text-gray-100">
            Track and manage all your vehicle transactions
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
      </section>

      {/* Auction Purchases */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-12">Auction Purchases</h2>

        {auctionPurchases.length === 0 ? (
          <p className="text-center text-xl text-gray-600 py-10">
            You haven't purchased any vehicles from auctions yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {auctionPurchases.map((purchase) => (
              <div
                key={purchase._id}
                className="relative bg-white border border-orange-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 flex flex-col"
              >
                {/* Status Tag */}
                <span className={`absolute top-6 left-6 z-10 px-6 py-2 rounded-full text-white font-bold text-sm shadow-md ${purchase.paymentStatus === 'pending' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                  {purchase.paymentStatus === 'pending' ? 'Pending Payment' : 'Payment Done'}
                </span>

                {/* Image */}
                <div className="relative">
                  <img
                    src={purchase.vehicleImage}
                    alt={purchase.vehicleName}
                    className="w-full h-56 object-contain bg-gray-100"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-orange-500 mb-3">
                    {purchase.vehicleName}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    Purchased on: <strong>{new Date(purchase.purchaseDate).toLocaleDateString()}</strong>
                  </p>

                  <div className="bg-gray-50 p-5 rounded-lg space-y-3 text-sm flex-grow">
                    <p><strong>Year:</strong> {purchase.year}</p>
                    <p><strong>Mileage:</strong> {purchase.mileage?.toLocaleString()} km</p>
                    <p><strong>Purchase Price:</strong> ₹{purchase.purchasePrice?.toLocaleString()}</p>
                    <p><strong>Seller:</strong> {purchase.sellerName}</p>
                  </div>

                  {/* Buttons - Always Visible & Properly Spaced */}
                  <div className="mt-6 space-y-3">
                    {/* More Details - Always Shown */}
                    <Link
                      to={`/buyer/purchases/${purchase._id}`}
                      className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-medium hover:bg-orange-600 transition shadow-md"
                    >
                      More Details
                    </Link>

                    {/* Pay Now - Only if Pending */}
                    {purchase.paymentStatus === 'pending' && (
                      <button
                        onClick={() => handlePayNow(purchase)}
                        className="block w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-md"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Current Rentals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-orange-500 mb-12">Current Rentals</h2>

          {rentals.length === 0 ? (
            <p className="text-center text-xl text-gray-600 py-10">
              You don't have any active rentals.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rentals.map((rental) => {
                const rentalId = rental._id || rental.investor_id;
                return (
                  <div
                    key={rentalId || rental.vehicleName}
                    className="bg-white border border-orange-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative">
                      <span className="absolute top-6 left-6 z-10 bg-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md">
                        Active
                      </span>
                      <img
                        src={rental.vehicleImage}
                        alt={rental.vehicleName}
                        className="w-full h-56 object-contain bg-gray-100"
                      />
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-orange-500 mb-3">
                        {rental.vehicleName}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4">
                        Period: <strong>
                          {new Date(rental.pickupDate).toLocaleDateString()} - {new Date(rental.dropDate).toLocaleDateString()}
                        </strong>
                      </p>

                      <div className="bg-gray-50 p-5 rounded-lg space-y-3 text-sm flex-grow">
                        <p><strong>Daily Rate:</strong> ₹{rental.costPerDay}</p>
                        <p><strong>Total Cost:</strong> ₹{rental.totalCost}</p>
                        <p><strong>Seller:</strong> {rental.sellerName}</p>
                        <p><strong>Contact:</strong> {rental.sellerPhone}</p>
                      </div>

                      {/* More Details Button - Always Visible */}
                      <div className="mt-6">
                        <Link
                          to={`/buyer/rentals/${rentalId}`}
                          state={{ from: '/buyer/purchases' }}
                          className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-medium hover:bg-orange-600 transition shadow-md"
                        >
                          More Details
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPayment={handlePayment}
        paymentDetails={paymentDetails}
        type="auction"
      />
    </div>
  );
}