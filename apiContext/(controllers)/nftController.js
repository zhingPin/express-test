const NFT = require("../model/nftModel");

exports.getAllNfts = async (req, res, next) => {
  const nfts = await NFT.find();

  //Send response
  res.status(200).json({
    status: "success",
    results: nfts.length,
    data: {
      nfts,
    },
  });
};
exports.getNft = async (req, res, next) => {
  const nft = await NFT.findById(req.params.id);

  //Send response
  res.status(200).json({
    status: "success",
    data: {
      nft,
    },
  });
};

exports.createNft = async (req, res, next) => {
  console.log(req.body);
  const newNFT = await NFT.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      nft: newNFT,
    },
  });
};
