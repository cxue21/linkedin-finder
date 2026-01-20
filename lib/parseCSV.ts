import { InputName } from '@/types';

export interface ParseResult {
  success: boolean;
  data?: InputName[];
  error?: string;
}

/**
 * Parse CSV or Excel file and extract Name and School columns
 */
export async function parseCSVFile(file: File): Promise<ParseResult> {
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'File size exceeds 5MB limit',
    };
  }

  // Check file type
  const isCsv = file.name.endsWith('.csv');
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

  if (!isCsv && !isExcel) {
    return {
      success: false,
      error: 'Please upload a CSV or Excel file',
    };
  }

  try {
    if (isCsv) {
      return await parseCSV(file);
    } else {
      return await parseExcel(file);
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse file. Please check the format.',
    };
  }
}

/**
 * Parse CSV file content
 */
async function parseCSV(file: File): Promise<ParseResult> {
  const text = await file.text();
  const lines = text.trim().split('\n');

  if (lines.length < 2) {
    return {
      success: false,
      error: 'CSV file must have headers and at least one data row',
    };
  }

  // Parse headers
  const headers = lines[0].split(',').map((h) => h.trim());
  const nameIndex = headers.findIndex(
    (h) => h.toLowerCase() === 'name'
  );
  const schoolIndex = headers.findIndex(
    (h) => h.toLowerCase() === 'school'
  );

  if (nameIndex === -1 || schoolIndex === -1) {
    return {
      success: false,
      error: "Missing required 'Name' or 'School' column",
    };
  }

  // Parse data rows
  const data: InputName[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = line.split(',').map((c) => c.trim());
    const name = cells[nameIndex];
    const school = cells[schoolIndex];

    if (!name || !school) {
      return {
        success: false,
        error: `Row ${i + 1} has empty Name or School cell`,
      };
    }

    data.push({ name, school });
  }

  // Validate row count
  if (data.length === 0) {
    return {
      success: false,
      error: 'No valid rows found in file',
    };
  }

  if (data.length > 100) {
    return {
      success: false,
      error: 'Maximum 100 names allowed. Your file has ' + data.length,
    };
  }

  return { success: true, data };
}

/**
 * Parse Excel file content (simplified - reads as plain text)
 * For production, use a library like xlsx
 */
async function parseExcel(file: File): Promise<ParseResult> {
  // For MVP, we'll require users to convert Excel to CSV
  // In production, use: npm install xlsx
  return {
    success: false,
    error: 'Excel support coming soon. Please convert to CSV format.',
  };
}
