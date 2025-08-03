import { PortfolioModel } from "../../../../../api/(models)/portfolioSchema.js";
import { getPortfolioValuationTool } from "./getPortfolioValuationTool.js";

export const recordPortfolioSnapshotTool = {
    definition: {
        type: "function",
        function: {
            name: "record_portfolio_snapshot",
            description: "Capture and store a point-in-time valuation of the user's portfolio.",
            parameters: {
                type: "object",
                properties: {
                    user_id: { type: "string" },
                    base_currency: { type: "string" },
                    tag: { type: "string", optional: true },
                    notes: { type: "string", optional: true }
                },
                required: ["user_id", "base_currency"]
            }
        }
    },
    handler: async ({ user_id, base_currency, tag, notes }) => {
        const valuation = await getPortfolioValuationTool.handler({ user_id, base_currency });

        const doc = await PortfolioModel.create({
            userId: user_id,
            takenAt: new Date(),
            baseCurrency: base_currency,
            positions: valuation.positions,
            totals: { value: valuation.totalValue },
            metadata: { tag, notes }
        });

        return {
            success: true,
            snapshotId: String(doc._id),
            totalValue: valuation.totalValue,
            takenAt: doc.takenAt.toISOString()
        };
    }
};
