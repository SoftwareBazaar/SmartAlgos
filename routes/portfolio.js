const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const { auth, updateActivity } = require('../middleware/auth');
const mt5APIService = require('../services/mt5APIService');
const mt5Service = require('../services/mt5Service');
const PortfolioPnL = require('../models/PortfolioPnL');

const router = express.Router();

const uploadRoot = path.join(__dirname, '..', 'uploads', 'portfolio');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const EXCEL_MIME_TYPES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12'
]);

const EXCEL_EXTENSIONS = new Set(['.xls', '.xlsx', '.xlsm', '.xlsb']);

const fileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isCsv = extension === '.csv' || file.mimetype === 'text/csv';
  const isExcel = EXCEL_EXTENSIONS.has(extension) || EXCEL_MIME_TYPES.has(file.mimetype);

  if (isCsv || isExcel) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV or Excel files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const BAD_REQUEST_STATUS = 400;
const CURRENCY_SYMBOL_REGEX = /[\u0024\u00A3\u20AC\u00A5\u20BF\u20A6\u20A9\u20B9\u20BD\u0E3F]/;

const normalizeHeader = (header = '') => header.toLowerCase().replace(/[^a-z0-9]/g, '');

const sanitizeString = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const str = String(value).trim();
  return str.length ? str : null;
};

const detectCurrencySymbol = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const match = String(value).match(CURRENCY_SYMBOL_REGEX);
  return match ? match[0] : null;
};

const parseNumericValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  let str = String(value).trim();
  if (!str) {
    return null;
  }

  const negativeByParens = /^\(.*\)$/.test(str);
  str = str.replace(/[()]/g, '');
  str = str.replace(/[\u2013\u2212\uFE63\u2014]/g, '-');
  str = str.replace(/[^0-9.,+-]/g, '');

  if (!str) {
    return null;
  }

  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      str = str.replace(/\./g, '').replace(/,/g, (match, index) => (index === lastComma ? '.' : ''));
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (lastComma > -1 && lastDot === -1) {
    if (str.length - lastComma <= 3) {
      str = str.replace(/,/g, (match, index) => (index === lastComma ? '.' : ''));
    } else {
      str = str.replace(/,/g, '');
    }
  } else {
    str = str.replace(/,/g, '');
  }

  if ((str.match(/-/g) || []).length > 1) {
    str = str.replace(/-/g, (match, index) => (index === 0 ? '-' : ''));
  }

  let numeric = Number.parseFloat(str);
  if (Number.isNaN(numeric)) {
    return null;
  }

  if (negativeByParens && numeric > 0) {
    numeric *= -1;
  }

  return numeric;
};

const tryParseDate = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  let str = String(value).trim();
  if (!str) {
    return null;
  }

  const numeric = Number(str);
  if (!Number.isNaN(numeric) && str.length >= 10 && str.length <= 13) {
    const millis = str.length === 10 ? numeric * 1000 : numeric;
    const unixDate = new Date(millis);
    if (!Number.isNaN(unixDate.getTime())) {
      return unixDate;
    }
  }

  let normalized = str
    .replace(/\./g, '-')
    .replace(/\//g, '-')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const europeanMatch = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})(.*)$/);
  if (europeanMatch) {
    let [, day, month, year, tail] = europeanMatch;
    if (year.length === 2) {
      year = `${year < '50' ? '20' : '19'}${year}`;
    }
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${tail ? tail : ''}`.trim();
    parsed = new Date(iso.replace(' ', 'T'));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const compactMatch = normalized.match(/^(\d{4})(\d{2})(\d{2})(.*)$/);
  if (compactMatch) {
    const [, year, month, day, tail] = compactMatch;
    const iso = `${year}-${month}-${day}${tail ? ` ${tail.trim()}` : ''}`;
    parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

const inferDateFromFilename = (filename) => {
  if (!filename) {
    return null;
  }

  const baseName = String(filename).split(/[\\/]/).pop();
  if (!baseName) {
    return null;
  }

  const nameWithoutExt = baseName.replace(/\.[^.]+$/, '');

  const match = nameWithoutExt.match(/((?:19|20)\d{2})[.\-_]?(0[1-9]|1[0-2])[.\-_]?(0[1-9]|[12]\d|3[01])(?:[T\s_-]?([01]\d|2[0-3])[:.\-]?([0-5]\d))?/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const safeHour = hour || '00';
  const safeMinute = minute || '00';

  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(safeHour), Number(safeMinute));
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return {
    dateValue: `${year}-${month}-${day}`,
    timeValue: hour !== undefined || minute !== undefined ? `${safeHour}:${safeMinute}` : null,
    columnBase: '__file_export_date'
  };
};

const ensureSyntheticColumnName = (records, baseName) => {
  if (!records || !records.length) {
    return baseName;
  }

  let candidate = baseName;
  let counter = 1;
  while (Object.prototype.hasOwnProperty.call(records[0], candidate)) {
    candidate = `${baseName}_${counter}`;
    counter += 1;
  }

  return candidate;
};

const injectSyntheticDateColumns = (records, fallback) => {
  if (!fallback) {
    return null;
  }

  const dateColumn = ensureSyntheticColumnName(records, fallback.columnBase || '__file_export_date');
  const timeColumn = fallback.timeValue
    ? ensureSyntheticColumnName(records, `${dateColumn}_time`)
    : null;

  for (const row of records) {
    row[dateColumn] = fallback.dateValue;
    if (timeColumn) {
      row[timeColumn] = fallback.timeValue;
    }
  }

  return { dateColumn, timeColumn };
};

const detectColumns = (headers) => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header)
  }));

  const findColumn = (candidates) => {
    for (const candidate of candidates) {
      const match = normalizedHeaders.find((header) => header.normalized === candidate);
      if (match) {
        return match.original;
      }
    }
    return null;
  };

  const closeColumn = findColumn(['closetime', 'closedatetime', 'closedate']);
  const timestampColumn = findColumn(['timestamp', 'datetime', 'executedat', 'executiontime', 'tradeexecutedat']);
  const openColumn = findColumn(['opentime', 'opendatetime', 'opendate']);
  const plainDateColumn = findColumn(['tradedate', 'date', 'valuedate', 'statementdate']);

  let dateColumn = closeColumn || timestampColumn || plainDateColumn || openColumn;
  let timeColumn = null;

  if (dateColumn) {
    const normalizedDate = normalizeHeader(dateColumn);
    const needsSeparateTime = ['date', 'tradedate', 'valuedate', 'statementdate'].includes(normalizedDate);
    if (needsSeparateTime) {
      timeColumn = findColumn(['time', 'tradingtime', 'closetime', 'opentime', 'executiontime', 'timestamp']);
    }
  } else if (openColumn && closeColumn) {
    dateColumn = closeColumn;
  } else if (plainDateColumn) {
    dateColumn = plainDateColumn;
    timeColumn = findColumn(['time', 'tradingtime', 'executiontime', 'timestamp']);
  }

  const profitColumn = findColumn([
    'profit',
    'netprofit',
    'realizedprofit',
    'pnl',
    'pl',
    'profitloss',
    'gainloss',
    'netpnl',
    'netpl',
    'netamount',
    'profitusd',
    'pnlusd',
    'realizedpnl'
  ]);

  const symbolColumn = findColumn(['symbol', 'pair', 'instrument', 'ticker', 'asset', 'market', 'product', 'security', 'symbolname']);
  const sideColumn = findColumn(['type', 'side', 'trade', 'position', 'direction', 'action', 'ordertype']);
  const quantityColumn = findColumn(['quantity', 'qty', 'volume', 'size', 'amount', 'lot', 'lots', 'contracts', 'units']);

  return {
    dateColumn,
    timeColumn,
    profitColumn,
    symbolColumn,
    sideColumn,
    quantityColumn
  };
};

const inferDateColumnFromData = (records) => {
  if (!records || !records.length) {
    return null;
  }

  const headers = Object.keys(records[0]);
  const headerInfos = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header)
  }));

  const sampleSize = Math.min(records.length, 50);
  let bestMatch = null;

  const candidateInfos = headerInfos.filter(({ normalized }) =>
    normalized &&
    (
      normalized.includes('date') ||
      normalized.includes('time') ||
      normalized.includes('timestamp') ||
      normalized.includes('executed') ||
      normalized.includes('closed') ||
      normalized.includes('opened')
    )
  );

  for (const candidate of candidateInfos) {
    let success = 0;
    let considered = 0;

    for (let index = 0; index < sampleSize; index += 1) {
      const value = records[index][candidate.original];
      if (value === null || value === undefined || value === '') {
        continue;
      }

      considered += 1;
      if (tryParseDate(value)) {
        success += 1;
      }
    }

    if (!success) {
      continue;
    }

    const ratio = considered ? success / considered : 0;
    const score = success + ratio + (candidate.normalized.includes('date') ? 0.5 : 0);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { score, candidate, success, ratio };
    }
  }

  if (!bestMatch) {
    return null;
  }

  const result = {
    dateColumn: bestMatch.candidate.original,
    timeColumn: null
  };

  const sampleWithValue = records.find((row) => {
    const raw = row[result.dateColumn];
    return raw !== null && raw !== undefined && String(raw).trim();
  });

  const dateContainsTime = sampleWithValue
    ? /:/.test(String(sampleWithValue[result.dateColumn]))
    : false;

  if (!dateContainsTime) {
    const timeCandidates = headerInfos.filter(({ normalized, original }) =>
      original !== result.dateColumn &&
      normalized &&
      (normalized.includes('time') || normalized.includes('timestamp'))
    );

    for (const timeCandidate of timeCandidates) {
      let combinedSuccess = 0;
      let combinedConsidered = 0;

      for (let index = 0; index < sampleSize; index += 1) {
        const datePart = records[index][result.dateColumn];
        const timePart = records[index][timeCandidate.original];

        if (!datePart || !timePart) {
          continue;
        }

        combinedConsidered += 1;
        if (tryParseDate(`${datePart} ${timePart}`)) {
          combinedSuccess += 1;
        }
      }

      if (
        combinedSuccess &&
        (combinedSuccess >= 3 || combinedSuccess / (combinedConsidered || 1) >= 0.6)
      ) {
        result.timeColumn = timeCandidate.original;
        break;
      }
    }
  }

  return result;
};
const parseDateFromRecord = (record, columns) => {
  const { dateColumn, timeColumn } = columns;
  const rawDate = dateColumn ? record[dateColumn] : null;
  const rawTime = timeColumn ? record[timeColumn] : null;

  const candidates = [];

  if (rawDate && rawTime) {
    candidates.push(`${rawDate} ${rawTime}`.trim());
  }

  if (rawDate) {
    candidates.push(rawDate);
  }

  if (rawTime) {
    candidates.push(rawTime);
  }

  for (const candidate of candidates) {
    const parsed = tryParseDate(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
};

const createBadRequestError = (message) => {
  const error = new Error(message);
  error.statusCode = BAD_REQUEST_STATUS;
  return error;
};

const convertExcelToCsv = (filePath) => {
  let workbook;
  try {
    workbook = XLSX.readFile(filePath, { cellDates: false, raw: false });
  } catch (error) {
    const conversionError = createBadRequestError('Unable to read the Excel file. Please ensure it is a valid .xls or .xlsx export.');
    conversionError.cause = error;
    throw conversionError;
  }

  if (!workbook.SheetNames.length) {
    throw createBadRequestError('The Excel file does not contain any worksheets.');
  }

  let targetSheetName = workbook.SheetNames[0];
  let targetSheet = workbook.Sheets[targetSheetName];

  outerLoop:
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

    let meaningfulRows = 0;
    for (const row of rows) {
      if (Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')) {
        meaningfulRows += 1;
        if (meaningfulRows > 1) {
          targetSheet = sheet;
          targetSheetName = sheetName;
          break outerLoop;
        }
      }
    }
  }

  const csv = XLSX.utils.sheet_to_csv(targetSheet, { FS: ',', RS: '\n' });
  if (!csv || !csv.trim()) {
    throw createBadRequestError(`The worksheet "${targetSheetName}" is empty.`);
  }

  return { csv, sheetName: targetSheetName };
};

const findDataHeaderIndex = (lines) => {
  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index].replace(/^\ufeff/, '');
    if (!rawLine || !rawLine.trim()) {
      continue;
    }

    const cells = rawLine.split(',').map((cell) => cell.trim());
    if (!cells.length) {
      continue;
    }

    const normalizedCells = cells.map((cell) => normalizeHeader(cell)).filter(Boolean);
    if (!normalizedCells.length) {
      continue;
    }

    const hasTimeLike = normalizedCells.some((cell) =>
      cell.includes('time') || cell.includes('date') || cell.includes('timestamp')
    );
    const hasProfitLike = normalizedCells.some((cell) =>
      [
        'profit',
        'netprofit',
        'realizedprofit',
        'pnl',
        'pl',
        'profitloss',
        'gainloss',
        'netpnl',
        'netpl',
        'netamount',
        'profitusd',
        'pnlusd',
        'realizedpnl'
      ].includes(cell)
    );

    if (hasTimeLike && hasProfitLike) {
      return index;
    }
  }

  return 0;
};

const prepareCsvForParsing = (csvContents) => {
  const lines = csvContents.split(/\r?\n/);
  const headerIndex = findDataHeaderIndex(lines);
  if (headerIndex <= 0) {
    return csvContents;
  }

  return lines.slice(headerIndex).join('\n');
};
const convertCsvToPnL = (csvContents, options = {}) => {
  const preparedCsv = prepareCsvForParsing(csvContents);
  if (!preparedCsv || !preparedCsv.trim()) {
    throw createBadRequestError('The uploaded CSV file is empty.');
  }
  let records;
  try {
    records = parse(preparedCsv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });
  } catch (error) {
    const parseError = createBadRequestError('Unable to parse the CSV file. Please confirm the export is comma-separated and includes a header row.');
    parseError.cause = error;
    throw parseError;
  }

  if (!records.length) {
    throw createBadRequestError('The CSV file does not contain any data rows.');
  }

  const columns = detectColumns(Object.keys(records[0]));

  if (!columns.dateColumn) {
    const inferredColumns = inferDateColumnFromData(records);
    if (inferredColumns && inferredColumns.dateColumn) {
      columns.dateColumn = inferredColumns.dateColumn;
      if (!columns.timeColumn && inferredColumns.timeColumn) {
        columns.timeColumn = inferredColumns.timeColumn;
      }
    }
  }

  if (!columns.dateColumn) {
    const filenameCandidates = [];
    if (options.originalName) {
      filenameCandidates.push(options.originalName);
    }
    if (options.filename) {
      filenameCandidates.push(options.filename);
    }
    if (options.filepath) {
      filenameCandidates.push(path.basename(options.filepath));
    }
    if (options.savedTo) {
      filenameCandidates.push(path.basename(options.savedTo));
    }

    for (const candidate of filenameCandidates) {
      const fallback = inferDateFromFilename(candidate);
      if (!fallback) {
        continue;
      }

      const injected = injectSyntheticDateColumns(records, fallback);
      if (injected) {
        columns.dateColumn = injected.dateColumn;
        if (!columns.timeColumn && injected.timeColumn) {
          columns.timeColumn = injected.timeColumn;
        }
        break;
      }
    }
  }

  if (!columns.profitColumn) {
    throw createBadRequestError('Could not detect a profit column. Include a column named Profit, PnL, or P/L in the CSV export.');
  }

  if (!columns.dateColumn) {
    throw createBadRequestError('Could not detect a trade date column. Include columns like Close Time, Date, or Timestamp in the CSV export.');
  }

  const parsedTrades = [];
  let skippedRows = 0;
  let currencySymbol = null;

  for (const row of records) {
    const rawProfitValue = row[columns.profitColumn];
    if (!currencySymbol) {
      currencySymbol = detectCurrencySymbol(rawProfitValue);
    }

    const profit = parseNumericValue(rawProfitValue);
    const tradeDate = parseDateFromRecord(row, columns);

    if (profit === null || tradeDate === null) {
      skippedRows += 1;
      continue;
    }

    const dateKey = tradeDate.toISOString().slice(0, 10);

    parsedTrades.push({
      date: dateKey,
      profit: Number(profit.toFixed(2)),
      symbol: sanitizeString(columns.symbolColumn ? row[columns.symbolColumn] : null),
      side: sanitizeString(columns.sideColumn ? row[columns.sideColumn] : null),
      quantity: columns.quantityColumn ? parseNumericValue(row[columns.quantityColumn]) : null
    });
  }

  if (!parsedTrades.length) {
    throw createBadRequestError('No profit values were detected in the CSV file after parsing.');
  }

  const pnlMap = new Map();
  for (const trade of parsedTrades) {
    pnlMap.set(trade.date, (pnlMap.get(trade.date) || 0) + trade.profit);
  }

  const sortedDates = Array.from(pnlMap.keys()).sort();
  const pnlEntries = sortedDates.map((date) => ({
    date,
    pnl: Number(pnlMap.get(date).toFixed(2))
  }));

  let runningCumulative = 0;
  const cumulativePnL = pnlEntries.map((entry) => {
    runningCumulative += entry.pnl;
    return {
      date: entry.date,
      cumulative: Number(runningCumulative.toFixed(2))
    };
  });

  const totalProfit = pnlEntries.reduce((sum, entry) => sum + entry.pnl, 0);
  const positiveDays = pnlEntries.filter((entry) => entry.pnl > 0).length;
  const negativeDays = pnlEntries.filter((entry) => entry.pnl < 0).length;
  const flatDays = pnlEntries.filter((entry) => entry.pnl === 0).length;

  const bestDay = pnlEntries.reduce((best, current) => {
    if (!best || current.pnl > best.pnl) {
      return current;
    }
    return best;
  }, null);

  const worstDay = pnlEntries.reduce((worst, current) => {
    if (!worst || current.pnl < worst.pnl) {
      return current;
    }
    return worst;
  }, null);

  const pnlByDate = pnlEntries.reduce((acc, entry) => {
    acc[entry.date] = entry.pnl;
    return acc;
  }, {});

  return {
    detectedColumns: columns,
    totalRows: records.length,
    parsedRows: parsedTrades.length,
    skippedRows,
    currency: currencySymbol,
    pnlEntries,
    pnlByDate,
    cumulativePnL,
    totals: {
      totalProfit: Number(totalProfit.toFixed(2)),
      averageDailyProfit: pnlEntries.length > 0 ? Number((totalProfit / pnlEntries.length).toFixed(2)) : 0,
      positiveDays,
      negativeDays,
      flatDays,
      bestDay,
      worstDay
    },
    sampleTrades: parsedTrades.slice(0, 25)
  };
};

// @route   POST /api/portfolio/upload-csv
// @desc    Upload and parse CSV/Excel file, save PnL data to database
// @access  Private
router.post('/upload-csv', [auth, updateActivity], (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a CSV file to upload.' });
    }

    try {
      const userId = req.user.id;
      const extension = path.extname(req.file.originalname).toLowerCase();
      const isExcelUpload = EXCEL_EXTENSIONS.has(extension) || EXCEL_MIME_TYPES.has(req.file.mimetype);

      let csvResult = null;
      let csvContents;

      if (isExcelUpload) {
        csvResult = convertExcelToCsv(req.file.path);
        csvContents = csvResult.csv;
      } else {
        csvContents = fs.readFileSync(req.file.path, 'utf8');
      }

      const previewLines = csvContents
        .split(/\r?\n/)
        .filter((line) => line.trim().length)
        .slice(0, 8);

      const analysis = convertCsvToPnL(csvContents, {
        originalName: req.file.originalname,
        filename: req.file.filename,
        filepath: req.file.path,
        savedTo: req.file.path,
        sourceType: isExcelUpload ? 'excel' : 'csv',
        sheetName: csvResult ? csvResult.sheetName : null
      });

      // Save PnL entries to database
      if (analysis.pnlEntries && analysis.pnlEntries.length > 0) {
        const sourceFile = {
          originalName: req.file.originalname,
          filename: req.file.filename,
          uploadedAt: new Date()
        };

        await PortfolioPnL.upsertPnLEntries(
          userId,
          analysis.pnlEntries,
          isExcelUpload ? 'excel' : 'csv',
          sourceFile
        );

        console.log(`[Portfolio] ✅ Saved ${analysis.pnlEntries.length} PnL entries for user ${userId}`);
      }

      return res.json({
        message: 'File processed and saved successfully',
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        savedTo: req.file.path,
        preview: previewLines,
        analysis,
        sourceType: isExcelUpload ? 'excel' : 'csv',
        sheetName: csvResult ? csvResult.sheetName : null,
        saved: true,
        entriesCount: analysis.pnlEntries?.length || 0
      });
    } catch (error) {
      if (error.statusCode === BAD_REQUEST_STATUS) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      if (error.cause) {
        console.error('File parsing failure:', error.cause);
      }

      console.error('[Portfolio] CSV upload error:', error);
      return next(error);
    }
  });
});

// ==================== MT5 REAL DATA INTEGRATION ====================

// @route   GET /api/portfolio/pnl
// @desc    Get PnL calendar data - from database (CSV uploads) or MT5
// @access  Private
router.get('/pnl', [auth, updateActivity], async (req, res) => {
  try {
    const userId = req.user.id;
    let pnlEntries = [];
    let source = 'database';

    // First, try to get data from database (CSV uploads)
    try {
      const dbEntries = await PortfolioPnL.getUserPnL(userId);
      
      if (dbEntries && dbEntries.length > 0) {
        pnlEntries = dbEntries.map(entry => ({
          date: entry.date,
          pnl: entry.pnl
        }));
        console.log(`[Portfolio] ✅ Loaded ${pnlEntries.length} PnL entries from database for user ${userId}`);
        source = 'database';
      }
    } catch (dbError) {
      console.warn('[Portfolio] Database fetch failed:', dbError.message);
    }

    // If no database data, try MT5 as fallback
    if (pnlEntries.length === 0) {
      try {
        const demoAccount = mt5Service.getDefaultDemoAccount();
        const connectionKey = `${demoAccount.login}@${demoAccount.server}`;
        
        // Connect to MT5 if not already connected
        try {
          await mt5APIService.getAccountInfo(connectionKey);
          // Already connected
        } catch {
          // Not connected, connect now
          await mt5APIService.connect({
            login: demoAccount.login,
            password: demoAccount.password,
            server: demoAccount.server
          });
        }

        // Get order history from last 30 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
        
        const history = await mt5APIService.getOrderHistory(connectionKey, {
          from: fromDate.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        });

        // Group trades by date and calculate daily PnL
        const pnlByDate = new Map();
        
        history.forEach(trade => {
          const tradeDate = new Date(trade.time);
          const dateKey = tradeDate.toISOString().split('T')[0];
          
          const currentPnL = pnlByDate.get(dateKey) || 0;
          pnlByDate.set(dateKey, currentPnL + (trade.profit || 0));
        });

        // Convert to array format
        pnlEntries = Array.from(pnlByDate.entries())
          .map(([date, pnl]) => ({
            date,
            pnl: parseFloat(pnl.toFixed(2))
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        if (pnlEntries.length > 0) {
          // Save MT5 data to database for future use
          await PortfolioPnL.upsertPnLEntries(userId, pnlEntries, 'mt5');
          console.log(`[Portfolio] ✅ Fetched ${pnlEntries.length} days of PnL data from MT5 and saved to database`);
          source = 'mt5';
        }
      } catch (mt5Error) {
        console.warn('[Portfolio] MT5 connection failed:', mt5Error.message);
        source = 'fallback';
      }
    }

    res.json({
      success: true,
      data: pnlEntries,
      source: source
    });
  } catch (error) {
    console.error('[Portfolio] Get PnL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PnL data',
      data: []
    });
  }
});

// @route   GET /api/portfolio/positions
// @desc    Get open positions from MT5 demo account
// @access  Private
router.get('/positions', [auth, updateActivity], async (req, res) => {
  try {
    const demoAccount = mt5Service.getDefaultDemoAccount();
    const connectionKey = `${demoAccount.login}@${demoAccount.server}`;
    
    try {
      // Connect to MT5 if not already connected
      try {
        await mt5APIService.getAccountInfo(connectionKey);
      } catch {
        await mt5APIService.connect({
          login: demoAccount.login,
          password: demoAccount.password,
          server: demoAccount.server
        });
      }

      const positions = await mt5APIService.getPositions(connectionKey);
      const accountInfo = await mt5APIService.getAccountInfo(connectionKey);

      // Transform positions to portfolio format
      const portfolioPositions = positions.map(pos => ({
        id: pos.ticket,
        symbol: pos.symbol,
        type: pos.type === 0 ? 'BUY' : 'SELL',
        volume: pos.volume,
        entry_price: pos.price_open,
        current_price: pos.price_current,
        profit: pos.profit,
        swap: pos.swap,
        open_time: pos.time
      }));

      res.json({
        success: true,
        data: {
          positions: portfolioPositions,
          account: {
            balance: accountInfo.balance,
            equity: accountInfo.equity,
            margin: accountInfo.margin,
            free_margin: accountInfo.free_margin,
            margin_level: accountInfo.margin_level,
            currency: accountInfo.currency
          },
          totalPositions: positions.length,
          totalProfit: positions.reduce((sum, pos) => sum + (pos.profit || 0), 0)
        },
        source: 'mt5'
      });
    } catch (mt5Error) {
      console.warn('[Portfolio] MT5 connection failed:', mt5Error.message);
      res.json({
        success: true,
        data: {
          positions: [],
          account: null,
          totalPositions: 0,
          totalProfit: 0
        },
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch positions'
    });
  }
});

// @route   GET /api/portfolio/account
// @desc    Get account summary from MT5 demo account
// @access  Private
router.get('/account', [auth, updateActivity], async (req, res) => {
  try {
    const demoAccount = mt5Service.getDefaultDemoAccount();
    const connectionKey = `${demoAccount.login}@${demoAccount.server}`;
    
    try {
      // Connect to MT5 if not already connected
      try {
        await mt5APIService.getAccountInfo(connectionKey);
      } catch {
        await mt5APIService.connect({
          login: demoAccount.login,
          password: demoAccount.password,
          server: demoAccount.server
        });
      }

      const accountInfo = await mt5APIService.getAccountInfo(connectionKey);
      const positions = await mt5APIService.getPositions(connectionKey);
      const history = await mt5APIService.getOrderHistory(connectionKey, {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      // Calculate portfolio metrics
      const totalProfit = positions.reduce((sum, pos) => sum + (pos.profit || 0), 0);
      const totalProfitClosed = history
        .filter(h => h.entry === 1) // Only closed deals
        .reduce((sum, h) => sum + (h.profit || 0), 0);

      const profitableTrades = history.filter(h => h.profit > 0).length;
      const totalTrades = history.filter(h => h.entry === 1).length;
      const winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100) : 0;

      res.json({
        success: true,
        data: {
          account: {
            login: accountInfo.login,
            balance: accountInfo.balance,
            equity: accountInfo.equity,
            margin: accountInfo.margin,
            free_margin: accountInfo.free_margin,
            margin_level: accountInfo.margin_level,
            currency: accountInfo.currency,
            leverage: accountInfo.leverage,
            server: accountInfo.server,
            company: accountInfo.company
          },
          portfolio: {
            total_value: accountInfo.equity,
            total_invested: accountInfo.balance,
            total_profit: totalProfit,
            profit_percentage: accountInfo.balance > 0 ? ((accountInfo.equity - accountInfo.balance) / accountInfo.balance * 100) : 0,
            open_positions: positions.length,
            total_closed_profit: totalProfitClosed,
            win_rate: winRate,
            total_trades: totalTrades,
            profitable_trades: profitableTrades
          }
        },
        source: 'mt5'
      });
    } catch (mt5Error) {
      console.warn('[Portfolio] MT5 connection failed:', mt5Error.message);
      res.json({
        success: true,
        data: {
          account: null,
          portfolio: null
        },
        source: 'fallback',
        error: mt5Error.message
      });
    }
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account data'
    });
  }
});

module.exports = router;




