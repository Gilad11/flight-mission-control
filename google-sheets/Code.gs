/**
 * Flight Mission Control — Google Apps Script Backend
 * ====================================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet with 3 tabs named exactly: flights, travelers, settings
 * 2. Add headers to each tab (Row 1):
 *    - flights:   id | flightNumber | date | time | direction | origin | destination | deleted | createdAt | updatedAt
 *    - travelers: id | flightId | serial | fullName | rank | militaryId | nationalId | passport | phone | group | unit | hotel | transportBooked | passportCheck | isArchived | createdAt | updatedAt
 *    - settings:  key | value | updatedAt
 * 3. Open Extensions > Apps Script, paste this code
 * 4. Deploy > New Deployment > Web App > Execute as: Me, Who has access: Anyone
 * 5. Copy the deployment URL and paste it in the app's SHEETS_API_URL constant
 */

// ━━━━━━━━━━━━━━━━━━━━ CONFIGURATION ━━━━━━━━━━━━━━━━━━━━

const SHEET_NAMES = {
  FLIGHTS: 'flights',
  TRAVELERS: 'travelers',
  SETTINGS: 'settings'
};

// Column headers for each sheet (must match exactly)
const FLIGHT_COLS = ['id','flightNumber','date','time','direction','origin','destination','deleted','createdAt','updatedAt'];
const TRAVELER_COLS = ['id','flightId','serial','fullName','rank','militaryId','nationalId','passport','phone','group','unit','hotel','transportBooked','passportCheck','isArchived','createdAt','updatedAt'];
const SETTING_COLS = ['key','value','updatedAt'];

// ━━━━━━━━━━━━━━━━━━━━ HTTP HANDLERS ━━━━━━━━━━━━━━━━━━━━

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'sync';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      case 'getFlights':
        return jsonResponse({ success: true, data: readSheet(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS) });

      case 'getTravelers':
        return jsonResponse({ success: true, data: readSheet(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS) });

      case 'getSettings':
        return jsonResponse({ success: true, data: readSheet(ss, SHEET_NAMES.SETTINGS, SETTING_COLS) });

      case 'sync':
        return jsonResponse({
          success: true,
          data: {
            flights: readSheet(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS),
            travelers: readSheet(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS),
            settings: readSheet(ss, SHEET_NAMES.SETTINGS, SETTING_COLS),
            syncedAt: new Date().toISOString()
          }
        });

      case 'ping':
        return jsonResponse({ success: true, message: 'pong', timestamp: new Date().toISOString() });

      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    switch (action) {
      // ── Single operations ──
      case 'addFlight':
        return jsonResponse(addRow(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS, body.data));

      case 'updateFlight':
        return jsonResponse(updateRow(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS, body.id, body.data));

      case 'deleteFlight':
        return jsonResponse(softDeleteRow(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS, body.id));

      case 'addTraveler':
        return jsonResponse(addRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, body.data));

      case 'updateTraveler':
        return jsonResponse(updateRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, body.id, body.data));

      case 'deleteTraveler':
        return jsonResponse(softDeleteTraveler(ss, body.id));

      case 'restoreTraveler':
        return jsonResponse(updateRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, body.id, { isArchived: false }));

      case 'permanentDeleteTraveler':
        return jsonResponse(hardDeleteRow(ss, SHEET_NAMES.TRAVELERS, body.id));

      case 'setSetting':
        return jsonResponse(upsertSetting(ss, body.key, body.value));

      // ── Batch operations ──
      case 'batch':
        return jsonResponse(processBatch(ss, body.operations));

      // ── Full sync (push all data from client) ──
      case 'fullPush':
        return jsonResponse(fullPush(ss, body.data));

      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ━━━━━━━━━━━━━━━━━━━━ SHEET OPERATIONS ━━━━━━━━━━━━━━━━━━━━

/**
 * Read all rows from a sheet and return as array of objects
 */
function readSheet(ss, sheetName, cols) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // Only header row

  const data = sheet.getRange(2, 1, lastRow - 1, cols.length).getValues();

  return data
    .filter(row => row[0] !== '') // Skip empty rows
    .map(row => {
      const obj = {};
      cols.forEach((col, i) => {
        let val = row[i];
        // Convert booleans stored as strings
        if (val === 'TRUE' || val === true) val = true;
        else if (val === 'FALSE' || val === false) val = false;
        // Convert numbers
        if (col === 'serial' || col === 'transportBooked') {
          if (typeof val === 'string' && val !== '') val = isNaN(Number(val)) ? val : Number(val);
        }
        obj[col] = val === '' ? null : val;
      });
      return obj;
    });
}

/**
 * Add a new row to a sheet
 */
function addRow(ss, sheetName, cols, data) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };

  data.updatedAt = new Date().toISOString();
  if (!data.createdAt) data.createdAt = data.updatedAt;

  const row = cols.map(col => {
    const val = data[col];
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return val;
  });

  sheet.appendRow(row);
  return { success: true, id: data.id };
}

/**
 * Update an existing row by ID (first column)
 */
function updateRow(ss, sheetName, cols, id, updates) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, error: 'Row not found: ' + id };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const rowIndex = ids.indexOf(id);

  if (rowIndex === -1) return { success: false, error: 'Row not found: ' + id };

  const actualRow = rowIndex + 2; // +1 for 0-index, +1 for header
  updates.updatedAt = new Date().toISOString();

  // Read current row
  const currentRow = sheet.getRange(actualRow, 1, 1, cols.length).getValues()[0];

  // Apply updates
  cols.forEach((col, i) => {
    if (updates.hasOwnProperty(col)) {
      let val = updates[col];
      if (typeof val === 'boolean') val = val ? 'TRUE' : 'FALSE';
      if (val === undefined || val === null) val = '';
      currentRow[i] = val;
    }
  });

  sheet.getRange(actualRow, 1, 1, cols.length).setValues([currentRow]);
  return { success: true, id: id };
}

/**
 * Soft delete a row (set deleted=TRUE)
 */
function softDeleteRow(ss, sheetName, cols, id) {
  return updateRow(ss, sheetName, cols, id, { deleted: true });
}

/**
 * Soft delete a traveler (set isArchived=TRUE)
 */
function softDeleteTraveler(ss, id) {
  return updateRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, id, { isArchived: true });
}

/**
 * Hard delete — remove row entirely
 */
function hardDeleteRow(ss, sheetName, id) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, error: 'Row not found: ' + id };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const rowIndex = ids.indexOf(id);

  if (rowIndex === -1) return { success: false, error: 'Row not found: ' + id };

  sheet.deleteRow(rowIndex + 2);
  return { success: true, id: id };
}

/**
 * Upsert a setting (insert or update by key)
 */
function upsertSetting(ss, key, value) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) return { success: false, error: 'Settings sheet not found' };

  const lastRow = sheet.getLastRow();
  const now = new Date().toISOString();

  if (lastRow > 1) {
    const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const rowIndex = keys.indexOf(key);

    if (rowIndex !== -1) {
      const actualRow = rowIndex + 2;
      sheet.getRange(actualRow, 2, 1, 2).setValues([[typeof value === 'object' ? JSON.stringify(value) : value, now]]);
      return { success: true, key: key, action: 'updated' };
    }
  }

  // Insert new
  sheet.appendRow([key, typeof value === 'object' ? JSON.stringify(value) : value, now]);
  return { success: true, key: key, action: 'inserted' };
}

// ━━━━━━━━━━━━━━━━━━━━ BATCH & FULL SYNC ━━━━━━━━━━━━━━━━━━━━

/**
 * Process a batch of operations
 */
function processBatch(ss, operations) {
  const results = [];

  for (const op of operations) {
    try {
      switch (op.action) {
        case 'addFlight':
          results.push(addRow(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS, op.data));
          break;
        case 'updateFlight':
          results.push(updateRow(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS, op.id, op.data));
          break;
        case 'deleteFlight':
          results.push(softDeleteRow(ss, SHEET_NAMES.FLIGHTS, FLIGHT_COLS, op.id));
          break;
        case 'addTraveler':
          results.push(addRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, op.data));
          break;
        case 'updateTraveler':
          results.push(updateRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, op.id, op.data));
          break;
        case 'deleteTraveler':
          results.push(softDeleteTraveler(ss, op.id));
          break;
        case 'restoreTraveler':
          results.push(updateRow(ss, SHEET_NAMES.TRAVELERS, TRAVELER_COLS, op.id, { isArchived: false }));
          break;
        case 'setSetting':
          results.push(upsertSetting(ss, op.key, op.value));
          break;
        default:
          results.push({ success: false, error: 'Unknown batch action: ' + op.action });
      }
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }

  return { success: true, results: results };
}

/**
 * Full push — replaces all data in sheets with client data
 * Used for initial sync or full overwrite
 */
function fullPush(ss, data) {
  const results = {};

  // Push flights
  if (data.flights && data.flights.length > 0) {
    const sheet = ss.getSheetByName(SHEET_NAMES.FLIGHTS);
    if (sheet) {
      // Clear existing data (keep headers)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, FLIGHT_COLS.length).clearContent();

      const now = new Date().toISOString();
      const rows = data.flights.map(f => FLIGHT_COLS.map(col => {
        if (col === 'updatedAt') return now;
        if (col === 'deleted') return f.deleted ? 'TRUE' : 'FALSE';
        const val = f[col];
        return val === undefined || val === null ? '' : val;
      }));

      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, FLIGHT_COLS.length).setValues(rows);
      }
      results.flights = { success: true, count: rows.length };
    }
  }

  // Push travelers
  if (data.travelers && data.travelers.length > 0) {
    const sheet = ss.getSheetByName(SHEET_NAMES.TRAVELERS);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, TRAVELER_COLS.length).clearContent();

      const now = new Date().toISOString();
      const rows = data.travelers.map(t => TRAVELER_COLS.map(col => {
        if (col === 'updatedAt') return now;
        if (col === 'transportBooked' || col === 'isArchived') return t[col] ? 'TRUE' : 'FALSE';
        const val = t[col];
        return val === undefined || val === null ? '' : val;
      }));

      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, TRAVELER_COLS.length).setValues(rows);
      }
      results.travelers = { success: true, count: rows.length };
    }
  }

  // Push settings
  if (data.settings) {
    const sheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, SETTING_COLS.length).clearContent();

      const now = new Date().toISOString();
      const rows = [];

      // Hotel ratings
      if (data.settings.hotelRatings) {
        Object.entries(data.settings.hotelRatings).forEach(([hotel, rating]) => {
          rows.push(['hotel_rating_' + hotel, String(rating), now]);
        });
      }

      // Group POCs
      if (data.settings.groupPocs) {
        Object.entries(data.settings.groupPocs).forEach(([group, poc]) => {
          rows.push(['poc_' + group, poc, now]);
        });
      }

      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, SETTING_COLS.length).setValues(rows);
      }
      results.settings = { success: true, count: rows.length };
    }
  }

  return { success: true, results: results };
}

// ━━━━━━━━━━━━━━━━━━━━ HELPERS ━━━━━━━━━━━━━━━━━━━━

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ━━━━━━━━━━━━━━━━━━━━ AUTO-SETUP ━━━━━━━━━━━━━━━━━━━━

/**
 * Run this function once to create the sheets with proper headers
 * Go to: Run > setupSheets
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create or get each sheet and set headers
  const sheetsConfig = [
    { name: SHEET_NAMES.FLIGHTS, cols: FLIGHT_COLS },
    { name: SHEET_NAMES.TRAVELERS, cols: TRAVELER_COLS },
    { name: SHEET_NAMES.SETTINGS, cols: SETTING_COLS }
  ];

  sheetsConfig.forEach(({ name, cols }) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }

    // Set headers in row 1
    sheet.getRange(1, 1, 1, cols.length).setValues([cols]);

    // Bold headers
    sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold');

    // Freeze header row
    sheet.setFrozenRows(1);

    // Auto-resize columns
    for (let i = 1; i <= cols.length; i++) {
      sheet.setColumnWidth(i, 120);
    }
  });

  // Delete the default "Sheet1" if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('גיליון1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) { /* ignore */ }
  }

  SpreadsheetApp.getUi().alert('Setup complete! Sheets created with headers:\n• flights\n• travelers\n• settings\n\nNow deploy as Web App.');
}
