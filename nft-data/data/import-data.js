import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { NftModel } from "../../api/(models)/nftSchema.js";
import { connectToDatabase } from "../../api/utils/connections/mongoDB.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectToDatabase();

const nfts = JSON.parse(
  fs.readFileSync(`${__dirname}/nft-sample.json`, "utf-8")
);

//IMPORT DATA
const importData = async () => {
  try {
    await NftModel.create(nfts);
    console.log("DATA successfully Loaded");
            console.log("server shutting down");

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//DELETE DATA
const deleteData = async () => {
  try {
    await NftModel.deleteMany();
    console.log("DATA successfully Deleted");

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
