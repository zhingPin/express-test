import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { NftModel } from "../(models)/nftSchema.js";
import APIFeatures from "../utils/helpers/apiFeatures.js";

const createNft = catchAsync(async (req, res, next) => {
  const newNft = await NftModel.create(req.body);
  if (!newNft) {
    return next(new AppError("Error creating NFT", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      nft: newNft,
    },
  });
});

const getAllNfts = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(NftModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const nfts = await features.query;

  if (features.pagination().pageDoesNotExist) {
    return next(new AppError("This page does not exist", 404));
  }

  if ((!nfts.length && req.query.page) || (!nfts.length && req.query.limit)) {
    return next(new AppError("You've scrolled too far !!!", 404));
  }

  res.status(200).json({
    status: "success",
    results: nfts.length,
    data: {
      nfts,
    },
  });
});

const getNft = catchAsync(async (req, res, next) => {
  const nft = await NftModel.findById(req.params.id);
  if (!nft) {
    return next(new AppError("NFT ID does not exist", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      nft,
    },
  });
});

const updateNft = catchAsync(async (req, res, next) => {
  const nft = await NftModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!nft) {
    return next(new AppError("Incorrect NFT ID update failed", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      nft,
    },
  });
});

const deleteNft = catchAsync(async (req, res, next) => {
  const nft = await NftModel.findByIdAndDelete(req.params.id);
  if (!nft) {
    return next(new AppError("Incorrect NFT ID delete failed", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const setDefaultQueryParams = (req, res, next) => {
  if (!req.query.limit) req.query.limit = "5";
  if (!req.query.sort) req.query.sort = "-ratingAverage,price";
  if (!req.query.fields) req.query.fields = "name,price,ratingAverage,creator";
  next();
};

//AGGREGATION PIPELINE
const getStats = catchAsync(async (req, res, next) => {
  const groupByField = req.query.groupBy || "mediaType";

  // Construct the aggregation pipeline
  const stats = await NftModel.aggregate([
    {
      $match: { rating: { $gte: 0 } }, // Match stage to filter documents with rating >= 0
    },
    {
      $group: {
        _id: { $toUpper: `$${groupByField}` }, // Group by the specified field, converted to uppercase
        numNFTs: { $sum: 1 }, // Count the number of NFTs
        avgRating: { $avg: "$rating" }, // Calculate the average rating
        numOfRatings: { $sum: "$rating" }, // Sum the ratings
        avgPrice: { $avg: "$price" }, // Calculate the average price
        minPrice: { $min: "$price" }, // Find the minimum price
        maxPrice: { $max: "$price" }, // Find the maximum price
      },
    },
    {
      $sort: { avgRating: -1 }, // Sort by average rating in descending order
    },
    // Exclude specific documents
    {
      $match: {
        _id: { $nin: ["HARMONY BEATS", "ALICE WONDERLAND"] }, // Exclude documents with _id "HARMONY BEATS" and "ALICE WONDERLAND"
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

//MONTHLY PLAN
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await NftModel.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numNFTStarts: { $sum: 1 },
        nfts: { $push: "$name" },
        startDates: { $push: "$startDates" }, // Include startDates in the group
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: "success",
    data: plan,
  });
});

const checkStatus = (req, res, next) => {
  if (!req.body.status) {
    req.body.status = "available";
  }
  next();
};

export const nftController = {
  getAllNfts,
  getNft,
  createNft,
  updateNft,
  deleteNft,
  checkStatus,
  setDefaultQueryParams,
  getStats,
  getMonthlyPlan,
};
