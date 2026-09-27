# Albie Autofill (extensión de Chrome)

Extensión interna de TAG: busca una sesión de onboarding de Hotel (tabla
`Onboardings_Hotel` en Airtable) y rellena el formulario **General Info /
Basic Information** de `app.albiebytag.com/dashboard/sites/{site_id}/site-customization`
con esos datos, sin guardar nada — la persona sigue revisando y clickeando
"Save Changes" a mano.

## Instalación (modo desarrollador)

1. Chrome → `chrome://extensions` → activar "Modo de desarrollador".
2. "Cargar descomprimida" → seleccionar esta carpeta (`extension/`).
3. Click en el ícono de la extensión → engranaje / "Opciones" (o clic derecho
   → Opciones) para configurar:
   - **Airtable Personal Access Token**: creá uno en
     [airtable.com/create/tokens](https://airtable.com/create/tokens) con
     scope `data.records:read` restringido **solo** a la base de
     Onboarding-Albie. No uses un token con permiso de escritura.
   - **Base ID**: se ve en la URL de la base en Airtable
     (`airtable.com/appXXXXXXXXXXXXXX/...`) o en la doc de la API
     (`airtable.com/api`).
   - **Tabla**: `Onboardings_Hotel` (ya viene precargado).

El token queda guardado solo en `chrome.storage.local` de ese navegador — no
se sube a ningún lado más que a la API de Airtable directamente.

## Uso

1. Abrí la página de Site Customization del sitio en Albie.
2. Click en el ícono de la extensión.
3. Buscá la propiedad por nombre, elegí el resultado correcto.
4. "Rellenar página actual" — completa los campos que tengan dato de origen.
5. **Revisá los valores y guardá manualmente** desde el botón de Albie. La
   extensión nunca clickea Save.

## Qué completa (v1 — scope: General Info → Basic Information)

| Campo Albie | Fuente (Onboardings_Hotel) |
|---|---|
| Site Name | Property Name |
| Address | Address + City + State/ZIP + Country (concatenado) |
| Phone Number | Phone |
| Web Address | Website URL |
| Subdomain | Subdomain |
| Date Format | Date Format |
| Timezone | Timezone (mapeado a la zona IANA más cercana que ofrece Albie — ver `src/mapping.js`) |
| Currency | Currency (solo si Albie soporta ese código) |
| Primary Language | Language (solo EN/ES/PT-BR — Albie no soporta el resto) |
| Primary Email | Notification Email |

## Qué NO completa (todavía)

- **Organization**, **Star Rating**: el onboarding no recolecta esos datos hoy.
- **Images & Video**: requiere subir archivos, no hay URL de origen utilizable
  directo (fuera de scope de un fill de texto).
- **Times & Limitations, Rooms Settings, Facilities, Search Filters,
  Secondary Email**: el onboarding actual no recolecta estos campos. Si en
  algún momento se agregan al formulario de onboarding, sumarlos a
  `buildFillPlan` en `src/mapping.js` es mecánico (mismo patrón).
- Las otras 3 tabs de Albie (**Info & Messages**, **Customization**,
  **Advanced**) — no están mapeadas todavía.

## Cómo está armado (para debuggear o extender)

- `src/mapping.js` — tablas de conversión (timezone/currency/language) +
  `buildFillPlan(fields)`, que arma qué completar a partir de un record de
  Airtable. Se carga tanto en el popup como en el content script.
- `src/content.js` — corre en la página de Albie. Rellena:
  - **Inputs de texto**: por el atributo `name` de React Hook Form
    (`siteDetails.siteName`, etc. — estables, no dependen del render).
  - **Selects (Radix/shadcn)**: Albie renderiza, junto al combobox visible
    (`<button role="combobox">`), un `<select>` nativo oculto con el mismo
    orden de opciones. El content script ubica el campo por el texto de su
    `<label>`, busca en el `<select>` oculto el índice de la opción con el
    valor deseado, abre el combobox visible y clickea la opción en esa misma
    posición. No depende de IDs `radix-_r_XX_` (esos cambian en cada carga de
    página).
- `src/popup.js` — busca en Airtable (`filterByFormula` + `SEARCH`) por
  "Property Name", arma el plan y se lo manda al content script por
  `chrome.tabs.sendMessage`.
- `src/options.js` — guarda el PAT/Base ID/tabla en `chrome.storage.local`.

## Seguridad

- El PAT de Airtable vive solo en el storage local de cada instalación de la
  extensión — cada persona que la use debería tener su propio token de solo
  lectura, no uno compartido con permiso de escritura.
- La extensión no clickea "Save Changes" ni ningún botón que persista datos
  en Albie — solo completa campos en el DOM para que una persona revise.
