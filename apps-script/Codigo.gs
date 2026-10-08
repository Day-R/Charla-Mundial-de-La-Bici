/**
 * Web App que conecta "Bici - Responde y Vota" con Google Sheets.
 * Se pega desde el Sheet (Extensiones → Apps Script), así usa esa misma hoja
 * sin importar en qué cuenta de Google esté.
 *
 * doPost: guarda una respuesta nueva (Fecha | Respuesta)
 * doGet:  devuelve todas las respuestas en JSON para pintar las burbujas
 */
const MAX_LENGTH = 200;

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Respuesta']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let texto = '';
  try {
    texto = String(JSON.parse(e.postData.contents).respuesta || '');
  } catch (err) {
    texto = String((e.parameter && e.parameter.respuesta) || '');
  }
  texto = texto.trim().slice(0, MAX_LENGTH);
  if (!texto) return json_({ ok: false, error: 'Respuesta vacía' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Prefijo ' para que Sheets no interprete fórmulas (=, +, -, @)
    const seguro = /^[=+\-@]/.test(texto) ? "'" + texto : texto;
    getSheet_().appendRow([new Date(), seguro]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet() {
  const sheet = getSheet_();
  const filas = sheet.getLastRow() - 1;
  const respuestas = filas > 0
    ? sheet.getRange(2, 2, filas, 1).getDisplayValues().map(r => r[0]).filter(Boolean)
    : [];
  return json_({ respuestas: respuestas });
}
