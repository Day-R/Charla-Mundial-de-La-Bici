# Charla Mundial de la Bici — Responde y Vota

Página interactiva de KM0 + Despacio: el público responde *¿Por qué Bogotá es la capital mundial de la bici?* y las respuestas aparecen como burbujas. Las respuestas se guardan en un Google Sheet y la página se actualiza cada 10 segundos con las de todos.

## Estructura

```
index.html            Página principal
img/                  Logos (KM0 y Despacio)
apps-script/Codigo.gs Script que conecta con Google Sheets
```

## Conectar con Google Sheets (una sola vez)

1. Abre el Google Sheet donde quieres guardar las respuestas (con la cuenta dueña del Sheet). Las respuestas se escriben en la primera pestaña, columnas **Fecha | Respuesta**.
2. Menú **Extensiones → Apps Script**.
3. Borra el contenido y pega todo [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Guarda.
4. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Autoriza los permisos y copia la **URL de la aplicación web** (termina en `/exec`).
6. En `index.html` pega esa URL en:
   ```js
   const SHEET_URL = 'https://script.google.com/macros/s/XXXX/exec';
   ```
7. Sube el cambio a GitHub.

Si `SHEET_URL` está vacía, la página funciona igual pero las respuestas solo quedan en el navegador de cada persona.

## Publicar con GitHub Pages

En el repo: **Settings → Pages → Branch: `main` / root → Save**. La página quedará en
https://day-r.github.io/Charla-Mundial-de-La-Bici/
