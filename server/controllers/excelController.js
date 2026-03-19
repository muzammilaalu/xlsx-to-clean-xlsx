import XLSX from "xlsx";
import { parseItems } from "../utils/parseItems.js";

/* --------------------------------------------------
   🔥 FORMAT ONLY DocumentDate → DD/MM/YYYY
-------------------------------------------------- */
function formatDate(value) {
  if (!value) return value;

  // Excel serial number (number format)
  if (typeof value === "number") {
    const utc_days = Math.floor(value - 25569);
    const utc_value = utc_days * 86400;
    const date = new Date(utc_value * 1000);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // String date
  if (typeof value === "string") {
    // Already DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

    const parsed = new Date(value);
    if (!isNaN(parsed)) {
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const year = parsed.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  return value;
}

export const convertExcel = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("File missing");
    }

    const file = req.files.file;

    const workbook = XLSX.read(file.data);

    /* 🔥 raw: false → dates as strings, dateNF → DD/MM/YYYY format */
    const sheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { raw: false, dateNF: "dd/mm/yyyy" }
    );

    let finalRows = [];

    sheet.forEach((row) => {
      let base = {};
      let items = [];

      Object.keys(row).forEach((key) => {
        let value = row[key];
        const lowerKey = key.toLowerCase();

        /* 🔥 DocumentDate format fix */
        if (lowerKey === "documentdate") {
          value = formatDate(value);
        }

        /* ITEMS PARSING */
        if (lowerKey === "items") {
          if (value && String(value).includes("code,description")) {
            items = parseItems(value);
          } else {
            items = [];
          }
          return;
        }

        /* KEEP RAW STRINGS */
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

    /* ---------------------------------------------------
       JSON → Excel (cellDates: false → date wapas number na bane)
    ---------------------------------------------------- */
    const newSheet = XLSX.utils.json_to_sheet(finalRows, { cellDates: false });
    const newBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

    const buffer = XLSX.write(newBook, {
      type: "buffer",
      bookType: "xlsx",
    });

    /* ---------------------------------------------------
       HEADERS — encodeURIComponent se corrupt file fix
    ---------------------------------------------------- */
    let originalName = file.name || "uploaded-file.xlsx";

    const parts = originalName.split(".");
    const ext = parts.pop() || "xlsx";
    const baseName = parts.join(".") || "converted-file";

    const outputName = `${baseName}-convert.${ext}`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    /* 🔥 FIX — filename* UTF-8 encoding, spaces/brackets safe */
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(outputName)}`
    );

    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};