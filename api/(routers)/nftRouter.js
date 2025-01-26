const express = require("express");
const nftController = require("../Controllers/nftController");
const router = express.Router();

//routes
router.route("/").get(nftController.getAllNfts).post(nftController.createNft);
router.route("/:id").get(nftController.getNft);

module.exports = router;
