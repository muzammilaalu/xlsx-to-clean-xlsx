import XLSX from "xlsx";
import { parseItems } from "../utils/parseItems.js";

export const convertExcel = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("File missing");
    }

    const file = req.files.file;

    const workbook = XLSX.read(file.data);
    const sheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );

    let finalRows = [];

    sheet.forEach((row) => {
      let base = {};
      let items = [];

      Object.keys(row).forEach((key) => {
        const value = row[key];
        const lowerKey = key.toLowerCase();

        if (lowerKey === "items") {
          if (value && String(value).includes("code,description")) {
            items = parseItems(value);
          } else {
            items = [];
          }
          return;
        }

        if (
          lowerKey !== "items" &&
          typeof value === "string" &&
          value.includes(";") &&
          value.includes(",")
        ) {
          base[key] = value;
          return;
        }

        base[key] = value;
      });

      if (items.length > 0) {
        items.forEach((it) => {
          finalRows.push({ ...base, ...it });
        });
      } else {
        finalRows.push(base);
      }
    });

    const newSheet = XLSX.utils.json_to_sheet(finalRows);
    const newBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

    const buffer = XLSX.write(newBook, {
      type: "buffer",
      bookType: "xlsx",
    });

    let originalName = file.name || "uploaded-file.xlsx";

    const parts = originalName.split(".");
    const ext = parts.pop() || "xlsx";
    const baseName = parts.join(".") || "converted-file";

    const outputName = `${baseName}-convert.${ext}`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputName}"`
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};