const mongoose = require("mongoose");

//create nft Schema
const nftSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  price: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  creator: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

//export NFT Schema
const NFT = mongoose.model("NFT", nftSchema);

module.exports = NFT;

// image: {
//   type: String,
//   trim: true,
// },
// audio: {
//   type: String,
//   trim: true,
// },
// video: {
//   type: String,
//   trim: true,
// },
// creator: {
//   type: String,
//   trim: true,
// },
// // url: String,
// description: {
//   type: String,
//   trim: true,
// },

// collection: {
//   type: String,
//   trim: true,
// },

// price,
// tokenId: tokenId.toNumber(),
// seller,
// owner,
// image,
// video,
// audio,
// name,
// description,
// tokenURI,
// creator,
// website,
// collection,
// batchNumber: batchNumber.toNumber(),
// batchSpecificId: batchSpecificId.toNumber(),
