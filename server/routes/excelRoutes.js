import express from "express";
import { convertExcel } from "../controllers/excelController.js";

const router = express.Router();

router.post("/convert-excel", convertExcel);

export default router;