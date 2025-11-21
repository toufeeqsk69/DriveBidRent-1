// controllers/buyer/purchase.controller.js
import RentalCost from '../../models/RentalCost.js';
import RentalRequest from '../../models/RentalRequest.js';
import Purchase from '../../models/Purchase.js';
import User from '../../models/User.js';
import mongoose from 'mongoose';

export const getPurchase = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const user = req.user;
    const rentalCosts = await RentalCost.find({ buyerId }).lean();

    const rentals = await Promise.all(rentalCosts.map(async (rentalCost) => {
      const rentalRequest = await RentalRequest.findById(rentalCost.rentalCarId).lean();
      if (!rentalRequest) return null;

      const seller = await User.findById(rentalCost.sellerId).lean();
      if (!seller) return null;

      return {
        _id: rentalRequest._id,
        investor_id: rentalRequest._id,
        vehicleName: rentalRequest.vehicleName,
        vehicleImage: rentalRequest.vehicleImage,
        costPerDay: rentalRequest.costPerDay,
        pickupDate: rentalRequest.pickupDate,
        dropDate: rentalRequest.dropDate,
        totalCost: rentalCost.totalCost,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        sellerPhone: seller.phone
      };
    }));

    const validRentals = rentals.filter(rental => rental !== null);
    const auctionPurchases = await Purchase.find({ buyerId }).lean();

    res.json({
      success: true,
      message: 'Purchase data fetched',
      data: { rentals: validRentals, auctionPurchases, user }
    });

    // res.render('buyer_dashboard/purchase', {
    //   rentals: validRentals,
    //   auctionPurchases,
    //   user
    // });
  } catch (err) {
    console.error('Error fetching purchase data:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load purchase data',
      data: null
    });

    // res.status(500).render('buyer_dashboard/error.ejs', {
    //   message: 'Failed to load purchase data',
    //   user: req.user || {}
    // });
  }
};

export const getAuctionPurchaseDetails = async (req, res) => {
  try {
    const purchaseId = req.params.id || req.query.id;
    const user = req.user;

    if (!purchaseId || !mongoose.Types.ObjectId.isValid(purchaseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID',
        data: null
      });

      // return res.status(400).render('buyer_dashboard/error.ejs', {
      //   message: 'Invalid purchase ID',
      //   user
      // });
    }

    const purchase = await Purchase.findById(purchaseId)
      .populate('sellerId', 'firstName lastName email phone city state')
      .populate('auctionId')
      .lean();

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        data: null
      });

      // return res.status(404).render('buyer_dashboard/error.ejs', {
      //   message: 'Purchase not found',
      //   user
      // });
    }

    if (purchase.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to purchase details',
        data: null
      });

      // return res.status(403).render('buyer_dashboard/error.ejs', {
      //   message: 'Unauthorized access to purchase details',
      //   user
      // });
    }

    res.json({
      success: true,
      message: 'Purchase details fetched',
      data: { purchase, user }
    });

    // res.render('buyer_dashboard/purchase_details', {
    //   purchase,
    //   user
    // });
  } catch (err) {
    console.error('Error fetching purchase details:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load purchase details',
      data: null
    });

    // res.status(500).render('buyer_dashboard/error.ejs', {
    //   message: 'Failed to load purchase details',
    //   user: req.user || {}
    // });
  }
};

export const getRentalDetails = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(rentalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental ID',
        data: null
      });

      // return res.status(400).render('buyer_dashboard/error.ejs', {
      //   message: 'Invalid rental ID',
      //   user
      // });
    }

    const rentalRequest = await RentalRequest.findById(rentalId).lean();
    if (!rentalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found',
        data: null
      });

      // return res.status(404).render('buyer_dashboard/error.ejs', {
      //   message: 'Rental not found',
      //   user
      // });
    }

    const rentalCost = await RentalCost.findOne({ rentalCarId: rentalId }).lean();
    if (!rentalCost) {
      return res.status(404).json({
        success: false,
        message: 'Rental cost details not found',
        data: null
      });

      // return res.status(404).render('buyer_dashboard/error.ejs', {
      //   message: 'Rental cost details not found',
      //   user
      // });
    }

    const seller = await User.findById(rentalRequest.sellerId).lean();
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller details not found',
        data: null
      });

      // return res.status(404).render('buyer_dashboard/error.ejs', {
      //   message: 'Seller details not found',
      //   user
      // });
    }

    const rentalDetails = {
      vehicleName: rentalRequest.vehicleName,
      vehicleImage: rentalRequest.vehicleImage,
      year: rentalRequest.year,
      AC: rentalRequest.AC,
      capacity: rentalRequest.capacity,
      condition: rentalRequest.condition,
      fuelType: rentalRequest.fuelType,
      transmission: rentalRequest.transmission,
      costPerDay: rentalRequest.costPerDay,
      driverAvailable: rentalRequest.driverAvailable,
      driverRate: rentalRequest.driverRate,
      pickupDate: new Date(rentalRequest.pickupDate).toLocaleDateString(),
      dropDate: new Date(rentalRequest.dropDate).toLocaleDateString(),
      totalCost: rentalCost.totalCost,
      seller: {
        name: `${seller.firstName} ${seller.lastName}`,
        email: seller.email,
        phone: seller.phone,
        address: seller.doorNo && seller.street ?
          `${seller.doorNo}, ${seller.street}, ${seller.city}, ${seller.state}` :
          'Address not available'
      }
    };

    res.json({
      success: true,
      message: 'Rental details fetched',
      data: { rental: rentalDetails, user }
    });

    // res.render('buyer_dashboard/rental_details', { rental: rentalDetails, user });
  } catch (err) {
    console.error('Error fetching rental details:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load rental details',
      data: null
    });

    // res.status(500).render('buyer_dashboard/error.ejs', {
    //   message: 'Failed to load rental details',
    //   user: req.user || {}
    // });
  }
};