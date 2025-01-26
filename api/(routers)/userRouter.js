const express = require("express");
const authController = require("../(controllers)/authController");
const playlistController = require("../(controllers)/playlistController");
const userController = require("../(controllers)/userController");

const router = express.Router();

// Auth routes
router.route("/auth").post(authController.createUser);

// Auth routes
router.route("/").get(authController.getAllUsers);

// Playlist routes
router.route("/playlist").post(playlistController.createOrUpdatePlaylist);
router.route("/playlist/:address").get(playlistController.getPlaylists);

router.route("/updateme").patch(userController.updateMe);

module.exports = router;
