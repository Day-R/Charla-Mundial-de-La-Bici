# Charla Mundial de la Bici — Responde y Vota

Página interactiva de KM0 + Despacio: el público responde *¿Por qué Bogotá es la capital mundial de la bici?* y las respuestas aparecen como burbujas. Las respuestas se guardan en un Google Sheet y la página se actualiza cada 10 segundos con las de todos.

## Estructura

```
index.html            Página principal
img/                  Logos (KM0 y Despacio)
apps-script/Codigo.gs Script que conecta con Google Sheets
```

## Conectar con Google Sheets (una sola vez)

1. Abre el Google Sheet donde quieres guardar las respuestas (con la cuenta dueña del Sheet). 
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

## Cambiar o agregar preguntas (admins)

Quien pueda editar el Google Sheet administra las preguntas, en la pestaña **Preguntas** (se crea sola la primera vez que se abre la página conectada):

| ID | Pregunta | Activa |
|----|----------|--------|
| P1 | ¿Por qué Bogotá es la capital mundial de la bici? | ☑ |
| P2 | ¿Qué le falta a Bogotá para pedalear más segura? | ☑ |

- **Agregar:** escribe la pregunta en una fila nueva y marca *Activa*. El ID se pone solo; no lo cambies después.
- **Cambiar la que se ve:** desmarca *Activa* en la vieja y marca la nueva.
- **Varias a la vez:** si hay más de una activa, la página muestra botones *Pregunta 1, Pregunta 2…*
- La página se actualiza sola cada 10 segundos.

Las respuestas quedan en la pestaña **Respuestas** con la pregunta a la que corresponden.

Para proyectar una pregunta específica: `https://day-r.github.io/Charla-Mundial-de-La-Bici/?p=P2&pantalla`

> Si cambias el código del script, hay que volver a implementarlo: **Implementar → Administrar implementaciones → ✏️ → Versión: Nueva versión → Implementar**.

Si `SHEET_URL` está vacía, la página funciona igual pero las respuestas solo quedan en el navegador de cada persona.

## Publicar con GitHub Pages

En el repo: **Settings → Pages → Branch: `main` / root → Save**. La página quedará en
https://day-r.github.io/Charla-Mundial-de-La-Bici/
