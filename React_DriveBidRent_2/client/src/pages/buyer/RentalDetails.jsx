// client/src/pages/buyer/RentalDetails.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRentalById, bookRental } from '../../services/buyer.services';
import DatePickerModal from './components/modals/DatePickerModal';
import PaymentModal from './components/modals/PaymentModal';
import ProcessingModal from './components/modals/ProcessingModal';
import SuccessModal from './components/modals/SuccessModal';

export default function RentalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [includeDriver, setIncludeDriver] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  useEffect(() => {
    if (location.state?.openRentModal && rental?.status === "available") {
      setShowDateModal(true);
    }
  }, [location.state, rental]);

  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const data = await getRentalById(id);
      setRental(data);
    } catch (error) {
      console.error("Error fetching rental details:", error);
      setError("Failed to load rental details");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (pickup, drop, driverIncluded) => {
    setPickupDate(pickup);
    setDropDate(drop);
    setIncludeDriver(driverIncluded);

    if (pickup && drop && rental) {
      const days = Math.ceil((new Date(drop) - new Date(pickup)) / (1000 * 60 * 60 * 24));
      const baseCost = days * (rental.costPerDay ?? 0);
      const driverCost = driverIncluded && rental.driverAvailable ? days * rental.driverRate : 0;
      setTotalCost(baseCost + driverCost);
    }
  };

  const handleRentNow = () => {
    if (rental?.status !== "available") return;
    if (!pickupDate || !dropDate) return alert("Please select both pickup and drop dates.");
    if (totalCost <= 0) return alert("Invalid rental period.");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(pickupDate) < today) return alert("Pickup date cannot be in the past.");
    if (new Date(dropDate) <= new Date(pickupDate)) return alert("Drop date must be after pickup date.");

    setShowDateModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod) => {
    setShowPaymentModal(false);
    setShowProcessingModal(true);

    try {
      const rentalData = {
        rentalCarId: id,
        sellerId: rental.seller._id,
        pickupDate,
        dropDate,
        totalCost,
        includeDriver,
      };

      const result = await bookRental(rentalData);

      if (result.success) {
        setTimeout(() => {
          setShowProcessingModal(false);
          setShowSuccessModal(true);
        }, 2000);
      } else {
        throw new Error(result.message || "Booking failed");
      }
    } catch (error) {
      setShowProcessingModal(false);
      alert("Booking failed: " + (error.response?.data?.message || error.message));
    }
  };

  const originPath = location.state?.from || "/buyer/rentals";
  const originLabel = useMemo(() => {
    const labels = {
      "/buyer": "← Back to Dashboard",
      "/buyer/rentals": "← Back to Rentals",
      "/buyer/purchases": "← Back to Purchases",
      "/buyer/wishlist": "← Back to Wishlist"
    };
    return labels[originPath] || "← Back";
  }, [originPath]);

  const isAvailable = rental?.status === "available";

  const redirectToDashboard = () => navigate("/buyer");
  const redirectBack = () => navigate(originPath);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-orange-600">Loading rental details...</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md">
          <div className="text-6xl mb-6">Warning</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">{error || "Rental Not Found"}</h2>
          <p className="text-gray-600 mb-8">The rental you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={redirectBack}
            className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg mt-6"
          >
            {originLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Main Container */}
      <div className="max-w-5xl mx-auto my-20 px-6">

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-500">

          {/* Hero Image */}
          <div className="relative h-80">
            <img
              src={rental.vehicleImage}
              alt={rental.vehicleName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-5xl md:text-6xl font-black mb-3">{rental.vehicleName}</h1>
              <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-xl font-bold">
                ₹{rental.costPerDay}/day
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-10 md:p-16">

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-center">
              <div>
                <p className="text-gray-600 text-sm">Year</p>
                <p className="text-3xl font-bold text-orange-600">{rental.year}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Capacity</p>
                <p className="text-3xl font-bold text-orange-600">{rental.capacity} seats</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Fuel</p>
                <p className="text-2xl font-bold text-orange-600 capitalize">{rental.fuelType}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Transmission</p>
                <p className="text-2xl font-bold text-orange-600 capitalize">{rental.transmission}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-bold text-orange-600 mb-6">Vehicle Details</h3>
                <div className="space-y-5">
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium">Condition</span>
                    <span className="text-green-600 font-bold capitalize">{rental.condition}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium">AC</span>
                    <span className={rental.AC === 'available' ? 'text-green-600' : 'text-red-600'}>
                      {rental.AC === 'available' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium">Driver</span>
                    <span className={rental.driverAvailable ? 'text-green-600' : 'text-gray-600'}>
                      {rental.driverAvailable ? 'Available' : 'Self-Drive Only'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-orange-600 mb-6">Seller Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-bold text-lg">{rental.seller.firstName} {rental.seller.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-bold">{rental.seller.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-bold">{rental.seller.email}</p>
                    {rental.seller.phone && <p className="font-bold">{rental.seller.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 mt-12">
              <button
                onClick={() => isAvailable && setShowDateModal(true)}
                disabled={!isAvailable}
                className={`flex-1 text-white text-2xl font-bold py-6 rounded-2xl transition-all shadow-xl ${isAvailable
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {isAvailable ? "Rent This Car" : "Already Rented"}
              </button>
              <a
                href={`mailto:${rental.seller.email}?subject=Inquiry about ${rental.vehicleName}`}
                className="flex-1 text-center bg-gray-700 text-white py-6 rounded-2xl font-bold hover:bg-gray-800 transition text-center"
              >
                Contact Seller
              </a>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={redirectBack}
                className="text-orange-600 font-bold hover:text-orange-700 transition"
              >
                {originLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DatePickerModal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onProceed={handleRentNow}
        onDateSelect={handleDateSelect}
        rental={rental}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handlePayment}
        totalCost={totalCost}
      />

      <ProcessingModal isOpen={showProcessingModal} />

      <SuccessModal
        isOpen={showSuccessModal}
        onRedirect={redirectToDashboard}
        message="Rental booked successfully!"
      />
    </div>
  );
}