// controllers/buyer/wishlist.controller.js
import Wishlist from '../../models/Wishlist.js';
import RentalRequest from '../../models/RentalRequest.js';
import AuctionRequest from '../../models/AuctionRequest.js';
import AuctionBid from '../../models/AuctionBid.js';

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).lean();

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        auctions: [],
        rentals: []
      });
      await wishlist.save();
    }

    const rentalWishlist = await RentalRequest.find({
      _id: { $in: wishlist.rentals || [] }
    }).populate('sellerId', 'firstName lastName').lean();

    const auctionWishlist = await AuctionRequest.find({
      _id: { $in: wishlist.auctions || [] },
      status: 'approved',
      started_auction: 'yes'
    }).populate('sellerId', 'firstName lastName').lean();

    // Attach currentHighestBid to each auction by querying AuctionBid
    for (let i = 0; i < auctionWishlist.length; i++) {
      const auc = auctionWishlist[i];
      try {
        const currentBid = await AuctionBid.findOne({ auctionId: auc._id, isCurrentBid: true }).lean();
        if (currentBid && currentBid.bidAmount != null) {
          auc.currentHighestBid = currentBid.bidAmount;
          auc.currentHighestBidBy = currentBid.userId || null;
        } else {
          // fallback to starting bid if no current bid
          auc.currentHighestBid = auc.startingBid != null ? auc.startingBid : 0;
          auc.currentHighestBidBy = null;
        }
      } catch (e) {
        console.error('Error fetching current bid for wishlist auction', auc._id, e);
        auc.currentHighestBid = auc.startingBid != null ? auc.startingBid : 0;
        auc.currentHighestBidBy = null;
      }
    }

    res.json({
      success: true,
      message: 'Wishlist fetched',
      data: { auctionWishlist, rentalWishlist, user: req.user }
    });

    // res.render('buyer_dashboard/wishlist', {
    //   user: req.user,
    //   auctionWishlist,
    //   rentalWishlist
    // });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load wishlist data',
      data: null
    });

    // res.status(500).render('buyer_dashboard/error.ejs', {
    //   user: req.user || {},
    //   message: 'Failed to load wishlist data'
    // });
  }
};

export const getWishlistApi = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).lean();

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        auctions: [],
        rentals: []
      });
      await wishlist.save();
    }

    // Populate the actual auction and rental documents for the API client
    const rentalWishlist = await RentalRequest.find({
      _id: { $in: wishlist.rentals || [] }
    }).populate('sellerId', 'firstName lastName').lean();

    const auctionWishlist = await AuctionRequest.find({
      _id: { $in: wishlist.auctions || [] },
      status: 'approved',
      started_auction: 'yes'
    }).populate('sellerId', 'firstName lastName').lean();

    const auctionIds = auctionWishlist.map(auction => auction._id);
    if (auctionIds.length) {
      const currentBids = await AuctionBid.find({
        auctionId: { $in: auctionIds },
        isCurrentBid: true
      })
        .select('auctionId bidAmount')
        .lean();

      const bidMap = currentBids.reduce((acc, bid) => {
        acc[bid.auctionId.toString()] = bid.bidAmount;
        return acc;
      }, {});

      auctionWishlist.forEach(auction => {
        auction.currentHighestBid = bidMap[auction._id.toString()] ?? auction.startingBid ?? 0;
      });
    }

    res.json({
      success: true,
      message: 'Wishlist items fetched',
      data: {
        auctionWishlist,
        rentalWishlist,
        user: req.user
      }
    });
  } catch (err) {
    console.error('Error fetching wishlist data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist'
    });
  }
};

export const addToWishlistApi = async (req, res) => {
  try {
    const { rentalId, auctionId, type } = req.body;

    if (!type || (type === 'rental' && !rentalId) || (type === 'auction' && !auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user._id,
        auctions: [],
        rentals: []
      });
    }

    if (type === 'rental' && rentalId) {
      const rental = await RentalRequest.findById(rentalId);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      if (!wishlist.rentals.includes(rentalId)) {
        wishlist.rentals.push(rentalId);
      }
    } else if (type === 'auction' && auctionId) {
      const auction = await AuctionRequest.findById(auctionId);
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      if (!wishlist.auctions.includes(auctionId)) {
        wishlist.auctions.push(auctionId);
      }
    }

    await wishlist.save();

    res.json({
      success: true,
      message: 'Item added to wishlist'
    });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist'
    });
  }
};

export const removeFromWishlistApi = async (req, res) => {
  try {
    const { rentalId, auctionId, type } = req.body;

    if (!type || (type === 'rental' && !rentalId) || (type === 'auction' && !auctionId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    if (type === 'rental' && rentalId) {
      wishlist.rentals = wishlist.rentals.filter(id => id.toString() !== rentalId);
    } else if (type === 'auction' && auctionId) {
      wishlist.auctions = wishlist.auctions.filter(id => id.toString() !== auctionId);
    }

    await wishlist.save();

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
};