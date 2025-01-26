import mongoose from "mongoose";
// const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  profilePic: {
    type: String,
    default:
      "https://gtsoe.infura-ipfs.io/ipfs/Qmb6BXiW3Mroj2LtZkwxdvHtWF3XS2e9PKX8V2PHe9wrW9",
  },
  name: {
    type: String,
    lowercase: true,
    maxlength: [40, "max 40 characters"],
    minlength: [3, "min 3 characters"],
  },
  address: {
    type: String,
    unique: true,
    required: [true, "Please connect wallet!"],
    createdAt: { type: Date, default: Date.now },
    // index: true,
  },
  email: {
    type: String,
    lowercase: true,
    // index: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // NFT data
  ownedNfts: [
    {
      tokenId: String,
      name: String,
    },
  ],

  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    { type: mongoose.Schema.Types.ObjectId, ref: "Audio" },
  ],

  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    { type: mongoose.Schema.Types.ObjectId, ref: "Audio" },
  ],

  watchlist: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    { type: mongoose.Schema.Types.ObjectId, ref: "Audio" },
  ],

  mostPlayed: [
    {
      video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      playCount: Number,
    },
    {
      audio: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      playCount: Number,
    },
  ],

  playlists: [
    {
      name: String,
      tokenId: [String],
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // Transactions stored on-chain
  transactions: [
    {
      hash: String,
      from: String,
      to: String,
      // other tx data
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

userSchema.pre(/^find/, function (next) {
  // points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Methods
userSchema.methods.addNft = function (nft) {
  this.ownedNfts.push(nft);
  return this.save();
};

userSchema.methods.addPlaylist = function (name, tokenId) {
  this.playlists.push({
    name: name,
    tokenId: tokenId,
    createdAt: Date.now(),
  });
  return this.save();
};

userSchema.methods.updatePlaylist = function (name, tokenId) {
  return this.model("User").updateOne(
    { "playlists.name": name },
    { $push: { "playlists.$.tokenId": tokenId } }
  );
};

userSchema.methods.fetchPlaylists = function () {
  return this.model("User")
    .findById(this.address)
    .select("playlists") // Select only the playlists field
    .exec();
};

//export User Schema
const User = mongoose.model("User", userSchema);

export default User;
