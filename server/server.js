
// import express from "express";
// import fileUpload from "express-fileupload";
// import XLSX from "xlsx";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(fileUpload());

// /* ------------------------------------------------------------------
//    SAFE CSV Split (Handles quoted strings correctly)
// ------------------------------------------------------------------- */
// function smartCSVsplit(str = "") {
//   const out = [];
//   let cur = "";
//   let inside = false;

//   for (let ch of str) {
//     if (ch === '"') { inside = !inside; continue; }

//     if (ch === "," && !inside) {
//       out.push(cur.trim());
//       cur = "";
//     } else {
//       cur += ch;
//     }
//   }

//   if (cur.trim()) out.push(cur.trim());
//   return out;
// }

// /* ------------------------------------------------------------------
//    Parse applied_taxes
// ------------------------------------------------------------------- */
// function parseAppliedTaxes(str = "") {
//   str = String(str).replace(/^"|"$/g, "");

//   if (!str.includes(";")) return {};

//   const [keys, values] = str.split(";");
//   const keyArr = keys.split(",");
//   const valArr = smartCSVsplit(values);

//   const out = {};

//   keyArr.forEach((k, i) => {
//     out["applied_taxes_" + k.trim()] = (valArr[i] || "").trim();
//   });

//   return out;
// }

// /* ------------------------------------------------------------------
//    Parse nested fields
// ------------------------------------------------------------------- */
// function parseNestedField(str = "") {
//   if (!str.includes(";") || !str.includes(",")) return str;

//   const [keys, values] = str.split(";");
//   const keyArr = keys.split(",");
//   const valArr = smartCSVsplit(values);

//   let out = {};
//   keyArr.forEach((k, i) => {
//     out[k.trim()] = (valArr[i] || "").trim();
//   });

//   return out;
// }

// /* ------------------------------------------------------------------
//    Parse Items column
// ------------------------------------------------------------------- */
// function parseItems(data = "") {
//   const rows = [];

//   const parts = [];
//   let cur = "";
//   let inside = false;

//   for (let ch of data) {
//     if (ch === '"') inside = !inside;

//     if (ch === ";" && !inside) {
//       parts.push(cur);
//       cur = "";
//     } else cur += ch;
//   }
//   if (cur.trim()) parts.push(cur);

//   const headers = smartCSVsplit(parts[0]);

//   for (let i = 1; i < parts.length; i++) {
//     const line = parts[i];
//     const cells = smartCSVsplit(line);

//     let obj = {};

//     headers.forEach((h, x) => {
//       let v = cells[x] || "";

//       if (h === "applied_taxes") {
//         const taxObj = parseAppliedTaxes(v);
//         Object.assign(obj, taxObj);
//       } else {
//         obj[h] = v;
//       }
//     });

//     rows.push(obj);
//   }

//   return rows;
// }

// /* ------------------------------------------------------------------
//    MAIN API — Excel → JSON → Clean → Excel
// ------------------------------------------------------------------- */
// app.post("/convert-excel", (req, res) => {
//   if (!req.files || !req.files.file) {
//     return res.status(400).send("File missing");
//   }

//   const file = req.files.file;

//   const workbook = XLSX.read(file.data);
//   const sheet = XLSX.utils.sheet_to_json(
//     workbook.Sheets[workbook.SheetNames[0]]
//   );

//   let finalRows = [];

//   sheet.forEach((row) => {
//     let base = {};
//     let items = [];

//     Object.keys(row).forEach((key) => {
//       const value = row[key];
//       const lowerKey = key.toLowerCase();

//       if (lowerKey === "items") {
//         if (value && String(value).includes("code,description")) {
//           items = parseItems(value);
//         } else {
//           items = [];
//         }
//         return;
//       }

//       if (
//         typeof value === "string" &&
//         value.includes(";") &&
//         value.includes(",") &&
//         !lowerKey.includes("items")
//       ) {
//         const nested = parseNestedField(value);
//         base = { ...base, ...nested };
//         return;
//       }

//       base[key] = value;
//     });

//     if (Array.isArray(items) && items.length > 0) {
//       items.forEach((it) => {
//         finalRows.push({ ...base, ...it });
//       });
//     } else {
//       finalRows.push(base);
//     }
//   });

//   /* ---------------------------------------------------
//      Convert Final JSON → Excel
//   ---------------------------------------------------- */
//   const newSheet = XLSX.utils.json_to_sheet(finalRows);
//   const newBook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

//   const buffer = XLSX.write(newBook, { type: "buffer", bookType: "xlsx" });

//   /* ---------------------------------------------------
//      FIXED — PERFECT Dynamic Output File Name
//   ---------------------------------------------------- */

//   let originalName = file.name;

//   // FORCE REAL NAME IF BROWSER SENDS WRONG NAME
//   if (!originalName || !originalName.includes(".")) {
//     originalName = req.files?.file?.name || "uploaded-file.xlsx";
//   }

//   const parts = originalName.split(".");
//   const ext = parts.pop() || "xlsx";
//   const base = parts.join(".") || "converted-file";

//   const outputName = `${base}-convert.${ext}`;

//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="${outputName}"`
//   );

//   res.send(buffer);
// });

// /* ------------------------------------------------------------------
//    START SERVER
// ------------------------------------------------------------------- */
// app.listen(5000, () =>
//   console.log("🔥 Excel Cleaner FINAL VERSION running on port 5000")
// );

// import express from "express";
// import fileUpload from "express-fileupload";
// import XLSX from "xlsx";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(fileUpload());

// /* ------------------------------------------------------------------
//    SAFE CSV Split (Handles quoted strings correctly)
// ------------------------------------------------------------------- */
// function smartCSVsplit(str = "") {
//   const out = [];
//   let cur = "";
//   let inside = false; 

//   for (let ch of str) {
//     if (ch === '"') { inside = !inside; continue; }

//     if (ch === "," && !inside) {
//       out.push(cur.trim());
//       cur = "";
//     } else {
//       cur += ch;
//     }
//   }

//   if (cur.trim()) out.push(cur.trim());
//   return out;
// }

// /* ------------------------------------------------------------------
//    Parse applied_taxes
// ------------------------------------------------------------------- */
// function parseAppliedTaxes(str = "") {
//   str = String(str).replace(/^"|"$/g, "");

//   if (!str.includes(";")) return {};

//   const [keys, values] = str.split(";");
//   const keyArr = keys.split(",");
//   const valArr = smartCSVsplit(values);

//   const out = {};

//   keyArr.forEach((k, i) => {
//     out["applied_taxes_" + k.trim()] = (valArr[i] || "").trim();
//   });

//   return out;
// }

// /* ------------------------------------------------------------------
//    Parse Items column
// ------------------------------------------------------------------- */
// function parseItems(data = "") {
//   const rows = [];

//   const parts = [];
//   let cur = "";
//   let inside = false;

//   for (let ch of data) {
//     if (ch === '"') inside = !inside;

//     if (ch === ";" && !inside) {
//       parts.push(cur);
//       cur = "";
//     } else cur += ch;
//   }
//   if (cur.trim()) parts.push(cur);

//   const headers = smartCSVsplit(parts[0]);

//   for (let i = 1; i < parts.length; i++) {
//     const line = parts[i];
//     const cells = smartCSVsplit(line);

//     let obj = {};

//     headers.forEach((h, x) => {
//       let v = cells[x] || "";

//       if (h === "applied_taxes") {
//         const taxObj = parseAppliedTaxes(v);
//         Object.assign(obj, taxObj);
//       } else {
//         obj[h] = v;
//       }
//     });

//     rows.push(obj);
//   }

//   return rows;
// }

// /* ------------------------------------------------------------------
//    MAIN API — Excel → JSON → Clean → Excel
// ------------------------------------------------------------------- */
// app.post("/convert-excel", (req, res) => {
//   if (!req.files || !req.files.file) {
//     return res.status(400).send("File missing");
//   }

//   const file = req.files.file;

//   const workbook = XLSX.read(file.data);
//   const sheet = XLSX.utils.sheet_to_json(
//     workbook.Sheets[workbook.SheetNames[0]]
//   );

//   let finalRows = [];

//   sheet.forEach((row) => {
//     let base = {};
//     let items = [];

//     Object.keys(row).forEach((key) => {
//       const value = row[key];
//       const lowerKey = key.toLowerCase();

//       // ---------------------------------------------------------
//       // 🟢 ONLY PROCESS ITEMS — EVERYTHING ELSE STAYS ORIGINAL
//       // ---------------------------------------------------------
//       if (lowerKey === "items") {
//         if (value && String(value).includes("code,description")) {
//           items = parseItems(value);
//         } else {
//           items = [];
//         }
//         return;
//       }

//       // 🔴 DO NOT auto-parse nested values (Payments, Taxes, etc.)
//       if (
//         lowerKey !== "items" &&
//         typeof value === "string" &&
//         value.includes(";") &&
//         value.includes(",")
//       ) {
//         base[key] = value; // keep raw string
//         return;
//       }

//       base[key] = value;
//     });

//     if (Array.isArray(items) && items.length > 0) {
//       items.forEach((it) => {
//         finalRows.push({ ...base, ...it });
//       });
//     } else {
//       finalRows.push(base);
//     }
//   });
  
//   /* ---------------------------------------------------
//      Convert Final JSON → Excel
//   ---------------------------------------------------- */
//   const newSheet = XLSX.utils.json_to_sheet(finalRows);
//   const newBook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

//   const buffer = XLSX.write(newBook, { type: "buffer", bookType: "xlsx" });

//   /* ---------------------------------------------------
//      FIXED — PERFECT Dynamic Output File Name
//   ---------------------------------------------------- */

//   let originalName = file.name;

//   if (!originalName || !originalName.includes(".")) {
//     originalName = req.files?.file?.name || "uploaded-file.xlsx";
//   }

//   const parts = originalName.split(".");
//   const ext = parts.pop() || "xlsx";
//   const baseName = parts.join(".") || "converted-file";

//   const outputName = `${baseName}-convert.${ext}`;

//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="${outputName}"`
//   );

//   res.send(buffer);
// });

// // const revFun = (arr1, arr2) => {
// //   let result = []
// //   for(let i = 0; i < arr1.length; i ++){
// //     for(let j = 0; j < arr2.length; j ++){
// //       if(arr1[i] === arr2[j]){
// //         result[i] = arr1[j]
// //       }
// //     }
// //   }
// //   return result
// // }

// // let arr1 = [1,2,3,4,5,6,7,1,2,3]
// // let arr2 = [1,2,3,4,5,6,7,8,9,10]

// // let result = revFun(arr1,arr2)
// // console.log(result)

// /* ------------------------------------------------------------------
//    START SERVER
// ------------------------------------------------------------------- */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log("🔥 Backend running on PORT", PORT));




import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import excelRoutes from "./routes/excelRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.use("/", (req, res) => {
  res.send("welcome to clean excel API's 1.0")
})
// Routes
app.use("/api", excelRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on PORT ${PORT}`);
});