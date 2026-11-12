/**
 * =========================================================================
 * GOOGLE APPS SCRIPT UNTUK GRAVITYTUNE LOGIN SYNC
 * =========================================================================
 * 
 * CARA MEMASANG DI GOOGLE SPREADSHEET ANDA:
 * 1. Buka spreadsheet Anda: https://docs.google.com/spreadsheets/d/1lzV20IjHlxJCW76reGVO9Nwibw0CRXt1K2jif2iyF2M/edit
 * 2. Klik menu "Ekstensi" (Extensions) -> pilih "Apps Script".
 * 3. Hapus kode bawaan (myFunction), lalu paste seluruh kode di bawah ini.
 * 4. Klik tombol "Deploy" (Terapkan) di pojok kanan atas -> pilih "New deployment" (Penerapan baru).
 * 5. Pada ikon gerigi pilih type: "Web app".
 *    - Description: "GravityTune Login Webhook"
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING!
 * 6. Klik "Deploy" -> Beri izin otorisasi Google jika diminta.
 * 7. Salin URL Web App yang dihasilkan (berawalan https://script.google.com/macros/s/.../exec).
 * 8. Masukkan URL tersebut ke Environment Variables di Vercel dengan nama:
 *    GOOGLE_SHEET_WEBHOOK_URL
 * =========================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // data: { type: 'guest' | 'google', username: '...', email: '...' }
    var type = (data.type || '').toLowerCase();
    var username = data.username || '';
    var email = data.email || '';
    
    if (type === 'guest') {
      // Cari baris kosong di Kolom A (mulai baris 4)
      var targetRow = 4;
      var lastRow = Math.max(sheet.getLastRow(), 25);
      for (var r = 4; r <= lastRow + 5; r++) {
        var val = sheet.getRange(r, 1).getValue().toString().trim();
        // Jika kosong atau hanya angka penomoran bawaan (contoh "1.", "2.", dll)
        if (!val || /^\d+\.?$/.test(val)) {
          targetRow = r;
          break;
        }
      }
      sheet.getRange(targetRow, 1).setValue(username);
    } 
    else if (type === 'google') {
      // Cari baris kosong di Kolom C (Email) & Kolom D (Username) mulai baris 4
      var targetRow = 4;
      var lastRow = Math.max(sheet.getLastRow(), 25);
      for (var r = 4; r <= lastRow + 5; r++) {
        var emailVal = sheet.getRange(r, 3).getValue().toString().trim();
        if (!emailVal || /^\d+\.?$/.test(emailVal)) {
          targetRow = r;
          break;
        }
      }
      sheet.getRange(targetRow, 3).setValue(email);
      sheet.getRange(targetRow, 4).setValue(username);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      type: type,
      row: targetRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("GravityTune Google Sheets Sync Service is Online.");
}
