import mongoose from "mongoose";

// Create NFT Schema
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

// Export NFT Schema
const NFT = mongoose.model("NFT", nftSchema);

export default NFT;
