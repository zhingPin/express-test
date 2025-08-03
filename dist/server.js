import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./utils/clients/mongoDB.js";
import { connectToOpenai } from "./utils/clients/openAIClient.js";
process.on("uncaughtException", (err) => {
    console.log("uncaughtException Safely Shutting Down Server");
    console.log(err);
    process.exit(1);
});
connectToDatabase();
connectToOpenai;
console.log(process.env.NODE_ENV);
const port = process.env.PORT || 8082;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});
process.on("unhandledRejection", (err) => {
    console.log("error name:", err.name);
    console.log("error message:", err.message);
    server.close(() => {
        process.exit(1);
    });
});
