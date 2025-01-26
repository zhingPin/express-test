import express from "express";
import nftController from "../(controllers)/nftController";
const router = express.Router();

//routes
router.route("/").get(nftController.getAllNfts).post(nftController.createNft);
router.route("/:id").get(nftController.getNft);

export default router;
