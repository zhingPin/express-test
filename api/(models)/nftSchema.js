import mongoose from "mongoose";
import slugify from "slugify";
import validator from "validator";

const nftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "NFT must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "NFT name must be less than 40 characters"],
      minlength: [6, "NFT name must be more than 5 characters"],
      validate: {
        validator: function (val) {
          return validator.isAlphanumeric(val, "en-US", { ignore: " " });
        },
        message: "NFT name must only contain letters and numbers",
      },
    },
    slug: String,

    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 2.5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    description: {
      type: String,
      //   required: [true, "NFT must have a description"],
      trim: true,
      maxlength: [200, "NFT's description must be less than 200 characters"],
      minlength: [10, "NFT's description must be more than 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "NFT's must have a price"],
      min: [1, "Price must be at least 1"],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount should be lower than the price!!!",
      },
    },
    coverImage: {
      type: String,
    },
    backGroundImage: {
      type: String,
    },
    mediaType: {
      enum: {
        values: ["jpg", "png", "mp4", "mp3"],
        message: ["incorrect format must be jpg, png, mp4 or mp3"],
      },
      type: String,
    },

    media: {
      type: String,
      required: [true, "NFT must have an image/video/audio"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    secretNft: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    category: {
      type: String,
      required: [true, "NFT must have a category"],
    },
    creator: {
      type: String,
      required: [true, "NFT must have a creator"],
    },
    maxgroupSize: {
      type: Number,
      // required: [true, "NFT must have a group size"],
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//MONGOOSE MIDDLEWARE METHODS---------------------------
nftSchema.virtual("duration").get(function () {
  return this.ratingAverage / 7;
});

//DOCUMNT MIDDLEWARE: pre runs before .save() or .create()
nftSchema.pre("save", function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

nftSchema.pre("save", function (next) {
  console.log("nft will now save in db....");
  next();
});

//DOCUMNT MIDDLEWARE: post runs after .save() or .create()
// nftSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE

//---------pre
// /^find/ applies to all find methods
nftSchema.pre(/^find/, function (next) {
  this.find({ secretNft: { $ne: true } });
  this.start = Date.now();
  next();
});

nftSchema.post(/^find/, function (doc, next) {
  console.log(`DB query took: ${Date.now() - this.start}*ms`);
  // console.log(doc);
  next();
});

//AGGREATION MIDDLEWARE
nftSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretNft: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});
export const NftModel = mongoose.model("Nft", nftSchema);
