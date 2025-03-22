import { Router } from "express";
import { nftController } from "../controllers/nftControllers.js";

const router = Router();
// router.param("id", nftController.checkId);

//TOP 5 NFT'S BY PRICE --change to by sales later
router
  .route("/top-nfts")
  .get(nftController.setDefaultQueryParams, nftController.getAllNfts);

router.route("/nfts-stats").get(nftController.getStats);
router.route("/monthly-plan/:year").get(nftController.getMonthlyPlan);

// NFT ROUTES
router.route("/").get(nftController.getAllNfts).post(nftController.createNft);

router
  .route("/:id")
  .get(nftController.getNft)
  .patch(nftController.updateNft)
  .delete(nftController.deleteNft);

export default router;
