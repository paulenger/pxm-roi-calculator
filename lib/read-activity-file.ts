import * as XLSX from "xlsx";
import {
  extractRosterUsers,
  parseActivityCsv,
  parseActivitySheets,
  type CsActivityRow,
} from "./cs-value-model";

export type ActivityFileContents = {
  rows: CsActivityRow[];
  rosterUsers: string[];
};

export async function readActivityFile(
  file: File,
): Promise<ActivityFileContents> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    return { rows: parseActivityCsv(await file.text()), rosterUsers: [] };
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheets = workbook.SheetNames.map((sheetName) => ({
      name: sheetName,
      rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: null,
        raw: true,
      }) as unknown[][],
    }));
    return {
      rows: parseActivitySheets(sheets),
      rosterUsers: extractRosterUsers(sheets),
    };
  }
  throw new Error(`Unsupported file type: ${file.name}. Use .xlsx or .csv.`);
}
