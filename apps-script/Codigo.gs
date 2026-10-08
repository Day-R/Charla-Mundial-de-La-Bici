/**
 * Web App que conecta "Bici - Responde y Vota" con Google Sheets.
 * Se pega desde el Sheet (Extensiones → Apps Script), así usa esa misma hoja
 * sin importar en qué cuenta de Google esté.
 *
 * Pestañas (se crean solas la primera vez):
 *   Preguntas:  ID | Pregunta | Activa
 *     - Para agregar una pregunta escribe una fila nueva (el ID se pone solo).
 *     - Marca "Activa" para mostrarla en la página; desmárcala para ocultarla.
 *   Respuestas: Fecha | ID Pregunta | Pregunta | Respuesta
 *
 * doPost: guarda una respuesta nueva
 * doGet:  devuelve las preguntas activas y sus respuestas en JSON
 */
const MAX_LENGTH = 200;
const PREGUNTA_INICIAL = '¿Por qué Bogotá es la capital mundial de la bici?';

function tab_(nombre, encabezados, alCrear) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nombre);
  if (!sheet) {
    sheet = ss.insertSheet(nombre);
    sheet.appendRow(encabezados);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
    if (alCrear) alCrear(sheet);
  }
  return sheet;
}

function preguntasSheet_() {
  return tab_('Preguntas', ['ID', 'Pregunta', 'Activa'], sheet => {
    sheet.appendRow(['P1', PREGUNTA_INICIAL, true]);
    sheet.getRange('C2:C200').insertCheckboxes();
    sheet.setColumnWidth(2, 480);
  });
}

function respuestasSheet_() {
  return tab_('Respuestas', ['Fecha', 'ID Pregunta', 'Pregunta', 'Respuesta']);
}

/** Lee las preguntas y asigna ID a las filas nuevas que no lo tengan. */
function leerPreguntas_() {
  const sheet = preguntasSheet_();
  const filas = sheet.getLastRow() - 1;
  if (filas <= 0) return [];
  const rango = sheet.getRange(2, 1, filas, 3);
  const datos = rango.getValues();

  let max = 0;
  datos.forEach(r => {
    const m = String(r[0]).match(/^P(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  });
  let cambio = false;
  datos.forEach(r => {
    if (String(r[1]).trim() && !String(r[0]).trim()) {
      r[0] = 'P' + (++max);
      cambio = true;
    }
  });
  if (cambio) rango.setValues(datos);

  return datos
    .filter(r => String(r[1]).trim())
    .map(r => ({
      id: String(r[0]),
      texto: String(r[1]).trim(),
      activa: r[2] === true || String(r[2]).toUpperCase() === 'TRUE' || String(r[2]).toUpperCase() === 'SI'
    }));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    body = e.parameter || {};
  }
  const texto = String(body.respuesta || '').trim().slice(0, MAX_LENGTH);
  if (!texto) return json_({ ok: false, error: 'Respuesta vacía' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const preguntas = leerPreguntas_();
    const pregunta = preguntas.find(p => p.id === String(body.pregunta)) || preguntas.find(p => p.activa);
    if (!pregunta) return json_({ ok: false, error: 'No hay preguntas activas' });

    // Prefijo ' para que Sheets no interprete fórmulas (=, +, -, @)
    const seguro = /^[=+\-@]/.test(texto) ? "'" + texto : texto;
    respuestasSheet_().appendRow([new Date(), pregunta.id, pregunta.texto, seguro]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet() {
  const preguntas = leerPreguntas_().filter(p => p.activa);
  const ids = new Set(preguntas.map(p => p.id));

  const sheet = respuestasSheet_();
  const filas = sheet.getLastRow() - 1;
  const respuestas = filas > 0
    ? sheet.getRange(2, 2, filas, 3).getDisplayValues()
        .filter(r => ids.has(r[0]) && r[2])
        .map(r => ({ p: r[0], r: r[2] }))
    : [];

  return json_({
    preguntas: preguntas.map(p => ({ id: p.id, texto: p.texto })),
    respuestas: respuestas
  });
}
