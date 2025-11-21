// controllers/buyer/dashboard.controller.js
import RentalRequest from '../../models/RentalRequest.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';

// Controller for dashboard home with featured listings
export const getDashboardHome = async (req, res) => {
  try {
    const featuredRentals = await RentalRequest.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    const featuredAuctions = await AuctionRequest.find({
      status: 'approved',
      started_auction: 'yes'
    })
      .sort({ auctionDate: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    const auctionIds = featuredAuctions.map((auction) => auction._id);
    let featuredAuctionsWithBids = featuredAuctions;

    if (auctionIds.length) {
      const currentBids = await AuctionBid.find({
        auctionId: { $in: auctionIds },
        isCurrentBid: true
      })
        .select('auctionId bidAmount')
        .lean();

      const currentBidMap = currentBids.reduce((acc, bid) => {
        acc[bid.auctionId.toString()] = bid.bidAmount;
        return acc;
      }, {});

      featuredAuctionsWithBids = featuredAuctions.map((auction) => ({
        ...auction,
        currentHighestBid: currentBidMap[auction._id.toString()] ?? auction.startingBid
      }));
    }

    res.json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: { featuredRentals, featuredAuctions: featuredAuctionsWithBids, user: req.user }
    });

    // res.render('buyer_dashboard/proj.ejs', {
    //   featuredRentals,
    //   featuredAuctions,
    //   user: req.user,
    //   error: null,
    //   success: null
    // });
  } catch (err) {
    console.error('Error fetching dashboard home:', err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while loading the dashboard',
      data: null
    });

    // res.status(500).render('buyer_dashboard/error.ejs', {
    //   user: req.user || {},
    //   message: 'An error occurred while loading the dashboard'
    // });
  }
};