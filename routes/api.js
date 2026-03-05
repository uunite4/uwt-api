import express from "express";
import getMetadata from "../controllers/metadata.js";

const router = express.Router();

// METADATA ENDPOINT
router.get("/metadata", getMetadata);

export default router;
