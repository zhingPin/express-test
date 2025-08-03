import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const portfolioSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: "User", // optional: if you have a User model
        },
        type: {
            type: String,
            enum: ["wallet", "exchange", "custody", "manual"],
            required: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        chain: {
            type: String, // e.g. "ethereum", "polygon"
            required: function () {
                return this.type === "wallet";
            },
        },
        address: {
            type: String,
            validate: {
                validator: (v) => !v || validator.isEthereumAddress(v),
                message: "Invalid Ethereum address",
            },
            required: function () {
                return this.type === "wallet";
            },
        },
        exchange: {
            type: String, // e.g. "binance"
            required: function () {
                return this.type === "exchange";
            },
        },
        exchangeCredRef: {
            type: Types.ObjectId,
            ref: "ExchangeCredentials",
        },
        asset: {
            type: String,
            required: function () {
                return this.type === "manual";
            },
        },
        quantity: {
            type: String,
            required: function () {
                return this.type === "manual";
            },
        },
        metadata: {
            type: Object,
            default: {},
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // auto-manages createdAt and updatedAt
    }
);

export const PortfolioModel = mongoose.model("Portfolio", portfolioSchema);
