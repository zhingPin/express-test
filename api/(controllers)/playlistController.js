const User = require("../../model/userModel");

// Create or update a playlist
exports.createOrUpdatePlaylist = async (req, res) => {
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
      // Create new playlist
      await user.updatePlaylist(name, tokenId);
      // // Update existing playlist
      // existingPlaylist.tokenId = tokenId;
    } else {
      // Create new playlist
      await user.addPlaylist(name, tokenId);
    }

    // Save the changes
    await user.save();

    res.status(200).json({ status: "success", data: { user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// // // Get playlists for a user by address
exports.getPlaylists = async (req, res) => {
  try {
    // const { address } = req.body;
    const { address } = await User.findOne(req.params.id);
    // console.log("pl:", address);

    if (!address) {
      return res.status(400).json({
        status: "fail",
        message: "Address is required for playlists",
      });
    }
    // Find user
    const user = await User.findOne({ address });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const playlists = await user.playlists;
    //  const newUser = await User.create(req.body);

    //Send response
    res.status(200).json({
      status: "success",
      results: playlists.length,
      data: {
        playlists: user.playlists,
      },
    });
    // console.log(data);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const user = // retrieve a user instance from your database;
//   user
//     .fetchPlaylists()
//     .then((playlists) => {
//       console.log("User Playlists:", playlists);
//     })
//     .catch((error) => {
//       console.error("Error fetching playlists:", error);
//     });

// const user = // retrieve a user instance from your database;
//   user
//     .fetchPlaylists()
//     .then((playlists) => {
//       console.log("User Playlists:", playlists);
//     })
//     .catch((error) => {
//       console.error("Error fetching playlists:", error);
//     });
