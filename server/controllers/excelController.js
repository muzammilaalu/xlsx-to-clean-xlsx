import XLSX from "xlsx";
import { parseItems } from "../utils/parseItems.js";

/* --------------------------------------------------
   DATE FORMAT FUNCTION (DD/MM/YYYY)
-------------------------------------------------- */
function formatDate(value) {
  if (!value) return value;

  const date = new Date(value);

  if (isNaN(date)) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export const convertExcel = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("File missing");
    }

    const file = req.files.file;

    const workbook = XLSX.read(file.data);

    /* 🔥 IMPORTANT FIX (DATE ISSUE SOLVED) */
    const sheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      {
        raw: false, // 👈 THIS FIXES DATE FORMAT
      }
    );

    let finalRows = [];

    sheet.forEach((row) => {
      let base = {};
      let items = [];

      Object.keys(row).forEach((key) => {
        let value = row[key];
        const lowerKey = key.toLowerCase();

        /* 🔥 AUTO DATE FORMAT FIX */
        if (lowerKey.includes("date")) {
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

        /* KEEP RAW STRING (NO AUTO SPLIT) */
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
       Convert JSON → Excel
    ---------------------------------------------------- */
    const newSheet = XLSX.utils.json_to_sheet(finalRows);
    const newBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

    const buffer = XLSX.write(newBook, {
      type: "buffer",
      bookType: "xlsx",
    });

    /* ---------------------------------------------------
       Dynamic File Name
    ---------------------------------------------------- */
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