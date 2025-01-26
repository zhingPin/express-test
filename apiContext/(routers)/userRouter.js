import express from "express";
import authController from "../(controllers)/authController.js";
import playlistController from "../(controllers)/playlistController.js";
import userController from "../(controllers)/userController.js";

const router = express.Router();

// Auth routes
router.route("/auth").post(authController.createUser);

// User routes
router.route("/").get(authController.getAllUsers);

// Playlist routes
router.route("/playlist").post(playlistController.createOrUpdatePlaylist);
router.route("/playlist/:address").get(playlistController.getPlaylists);

// User update route
router.route("/updateme").patch(userController.updateMe);

export default router;
