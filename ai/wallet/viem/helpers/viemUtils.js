// helpers/viemUtils.ts
import { createViemPublicClient } from "../createViemPublicClient.js";
export function getPublicClient(chain) {
    const publicClients = createViemPublicClient(chain);
    console.log("Public clients created successfully.");
    return Array.isArray(publicClients) ? publicClients[0] : publicClients;
}
