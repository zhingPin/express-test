import User from "../(models)/userModel.js"; // Correct import statement

const playlistController = {
  createOrUpdatePlaylist: async (req, res) => {
    try {
      const { name, tokenId, address } = req.body;

      // Find user
      const user = await User.findOne({ address });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if playlist exists
      const existingPlaylist = user.playlists.find((p) => p.name === name);

      if (existingPlaylist) {
        // Update existing playlist
        existingPlaylist.tokenId = tokenId; // update the tokenId
      } else {
        // Create new playlist
        user.playlists.push({ name, tokenId });
      }

      // Save the changes
      await user.save();

      res.status(200).json({ status: "success", data: { user } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getPlaylists: async (req, res) => {
    try {
      const { address } = req.params;

      // Find user by address
      const user = await User.findOne({ address });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Send response with user's playlists
      res.status(200).json({
        status: "success",
        results: user.playlists.length,
        data: {
          playlists: user.playlists,
        },
      });
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default playlistController;
