// client/src/pages/buyer/components/CarCard.jsx
import { Link } from "react-router-dom";

export default function CarCard({ item, type, isInWishlist, onToggleWishlist, returnPath }) {
  const isAuction = type === "auction";

  const detailsLink = isAuction ? `/buyer/auctions/${item._id}` : `/buyer/rentals/${item._id}`;

  const getActionText = () => (isAuction ? "Place Bid" : "Rent Now");

  const detailLinkState = !isAuction && returnPath ? { from: returnPath } : undefined;
  const rentActionState =
    !isAuction
      ? {
        ...(returnPath ? { from: returnPath } : {}),
        openRentModal: true
      }
      : undefined;

  return (
    <div className="relative bg-white border border-orange-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 flex flex-col h-full">
      {/* Tags */}
      {isAuction && (
        <span className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
          Hot
        </span>
      )}
      {!isAuction && (
        <span className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium z-10">
          New
        </span>
      )}

      {/* Wishlist Heart */}
      <button
        onClick={onToggleWishlist}
        className={`absolute top-4 right-4 text-3xl z-10 transition-all ${isInWishlist ? "text-orange-500 drop-shadow-lg" : "text-gray-300 hover:text-gray-500"
          }`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isInWishlist ? "♥" : "♡"}
      </button>

      {/* Image */}
      <img
        src={item.vehicleImage}
        alt={item.vehicleName}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
        }}
      />

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-orange-500">{item.vehicleName}</h3>

        {isAuction ? (
          <p className="text-gray-600 mt-2">
            Auction on: <strong>{new Date(item.auctionDate).toLocaleDateString()}</strong>
          </p>
        ) : (
          <p className="text-gray-600 mt-2">
            Cost/day: <strong>₹{item.costPerDay}</strong>
          </p>
        )}

        {/* Details */}
        <div className="mt-4 bg-gray-50 p-5 rounded-lg flex-grow space-y-3 text-sm">
          <p><strong>Year:</strong> {item.year}</p>

          {isAuction ? (
            <>
              <p><strong>Mileage:</strong> {item.mileage?.toLocaleString()} km</p>
              <p>
                <strong>Condition:</strong>{" "}
                {item.condition?.charAt(0).toUpperCase() + item.condition?.slice(1)}
              </p>
            </>
          ) : (
            <>
              <p><strong>Capacity:</strong> {item.capacity} passengers</p>
              <p><strong>AC:</strong> {item.AC === "available" ? "Yes" : "No"}</p>
            </>
          )}
        </div>

        {/* Price */}
        <div className="mt-4">
          {isAuction ? (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Starting at ₹{(Number(item.startingBid) || 0).toLocaleString()}</span>
              <span className="text-xs uppercase text-gray-500 mt-1">Current Price</span>
              <span className="text-3xl md:text-4xl font-extrabold text-orange-600 leading-tight tracking-tight mt-1">₹{(Number(item.currentHighestBid ?? item.startingBid) || 0).toLocaleString()}</span>
            </div>
          ) : (
            <div className="text-2xl md:text-3xl font-bold text-orange-600">₹{(Number(item.costPerDay) || 0).toLocaleString()}/day</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link
            to={detailsLink}
            state={detailLinkState}
            className="flex-1 bg-gray-700 text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            View Details
          </Link>
          {!isAuction && (
            <Link
              to={detailsLink}
              state={rentActionState}
              className="flex-1 bg-orange-500 text-white text-center py-3 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              {getActionText()}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}