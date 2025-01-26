import NFT from "../model/nftModel.js";
import AppError from "../(utils)/appError.js";

const nftController = {
  getAllNfts: async (req, res, next) => {
    try {
      const nfts = await NFT.find();

      res.status(200).json({
        status: "success",
        results: nfts.length,
        data: {
          nfts,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getNft: async (req, res, next) => {
    try {
      const nft = await NFT.findById(req.params.id);

      if (!nft) {
        return next(new AppError("NFT not found", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          nft,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  createNft: async (req, res, next) => {
    try {
      const newNFT = await NFT.create(req.body);

      res.status(201).json({
        status: "success",
        data: {
          nft: newNFT,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default nftController;
