# Creador de Filtros de Gmail (Gmail Filter Builder)

[English](README.md) | **Español**

> Herramienta visual para construir búsquedas y filtros avanzados de Gmail sin memorizar la sintaxis. Incluye lógica `Y (AND)`/`O (OR)` por condición y por grupo con agrupación en 2 niveles (`+ Añadir grupo`), diagnósticos en tiempo real sobre reglas reales de Gmail, resumen en lenguaje natural, PWA instalable sin conexión y 31 variantes idiomáticas. Sin backend ni dependencias.

[![Usar ahora - Live Demo](https://img.shields.io/badge/Usar_Ahora-Live_Demo-blue?logo=googlechrome)](https://salmonidas.github.io/gmail-filters/)

---

## 🛑 El problema de Gmail
El buscador de Gmail es muy potente, pero crear filtros complejos (como `(label:trabajo OR subject:urgente) -subject:Day`) exige recordar operadores exactos, reglas reales de precedencia (donde `OR` liga más fuerte que el espacio y puede anular exclusiones `-`), y limitaciones ocultas (~1.500 caracteres máximos, operadores válidos solo en búsqueda frente a filtros entrantes, o la ausencia de comodines `*`).

## ✨ La solución
**Gmail Filter Builder** es una aplicación web gratuita y 100% privada que se ejecuta íntegramente en tu navegador:

1. **Añade condiciones y grupos:** Elige entre 39 operadores oficiales organizados por categorías, activa exclusiones (`NOT`), combina cada fila o subgrupo con `Y (AND)` / `O (OR)` y crea subgrupos opcionales en 2 niveles (`+ Añadir grupo`).
2. **Diagnósticos y resumen al instante:** Detecta trampas reales de Gmail (como exclusiones dentro de grupos `OR` con botón de corrección en 1 clic, aviso del límite de ~1.500 caracteres, operadores de solo búsqueda, `in:archive` / `deliveredto:me` inválidos, grupos compuestos negados, comodines `*` o `or` en minúsculas).
3. **Copia, guarda, comparte y aplica:** Guarda tus reglas en la Biblioteca local, compártelas por enlace URL o pulsa **Abrir en Gmail** siguiendo la guía ilustrada de 7 pasos.

---

## 🚀 Características principales
- **39 operadores oficiales de Gmail:** Personas y listas (`from:`, `to:`, `cc:`, `bcc:`, `deliveredto:`, `list:`), texto exacto y proximidad (`"..."`, `+palabra`, `AROUND`), adjuntos y Drive (`has:attachment`, `filename:`, `has:drive`, `has:document`, `has:spreadsheet`, `has:presentation`, `has:youtube`), calendario y cabeceras (`header:X-Google-Calendar-Notification:*` con 18 eventos, `rfc822msgid:`), organización (`category:`, `label:`, `in:`, `has:userlabels`, `has:nouserlabels`, `label:encryptedmail`), estado y 12 Superstars (`is:*`, `has:<star>`), y fechas/tamaño (incl. Unix epoch y bytes).
- **Agrupación progresiva en 2 niveles:** Lista plana sencilla por defecto con selector `AND`/`OR` por condición y por grupo, y botón `+ Añadir grupo` para lógica mixta (entrecomilla/agrupa secuencias mixtas con paréntesis automáticamente y aplana grupos `OR` negados `-(A OR B)` a `-A -B`).
- **Editor manual bidireccional:** Edita la consulta manualmente y vuelve al constructor visual conservando grupos `OR`, `AROUND`, cabeceras y exclusiones.
- **Privacidad total y PWA:** Sin servidores ni rastreo, ejecutable offline vía Service Worker, soporte RTL (`ar`) y 31 idiomas/variantes regionales.

---

## 📚 Operadores cubiertos
| Operador | Descripción |
|---|---|
| `from:` / `to:` / `cc:` / `bcc:` | Remitente y destinatarios (`to:` incluye Para, CC y BCC enviado) |
| `deliveredto:` / `list:` | Cabecera `Delivered-To` (`+alias`) y listas de correo (`List-Id`) |
| `subject:` / cuerpo / `"..."` / `+` / `AROUND` | Asunto, cuerpo, frase exacta, palabra exacta y proximidad entre palabras |
| `has:attachment` / `filename:` | Adjuntos (incl. imágenes en línea) y nombre o extensión (sin `*`) |
| `has:drive` / `document` / `spreadsheet` / `presentation` / `youtube` | Enlaces de Google Drive, Docs, Sheets, Slides y YouTube |
| `header:X-Google-Calendar-Notification:` / `rfc822msgid:` | Notificaciones oficiales de Google Calendar (18 tokens) y `Message-ID` |
| `category:` | Pestañas automáticas (`primary`, `social`, `promotions`, `updates`, `forums`, `reservations`, `purchases`) |
| `label:` / `has:userlabels` / `has:nouserlabels` / `label:encryptedmail` | Etiquetas propias, sin etiqueta y cifrado en cliente (Búsqueda) |
| `in:` | Carpetas del sistema (`inbox`, `sent`, `drafts`, `spam`, `trash`, `anywhere`, `snoozed`, `scheduled`, `chats` — Gmail no tiene `in:archive`) |
| `is:read` / `unread` / `starred` / `important` / `muted` / `has:<star>` | Estado de lectura, silenciado y 12 Superstars (Búsqueda) |
| `after:` / `before:` / `newer_than:` / `older_than:` | Fechas absolutas (`AAAA/MM/DD` o Unix epoch) y relativas (`7d`, `2m`, `1y`) |
| `larger:` / `smaller:` / `size:` | Tamaño del mensaje (`5M`, `500K` o tamaño mínimo en bytes con `size:`) |
| `OR` / `{ }` / `-término` / `(…)` | Unión lógica OR, exclusiones y paréntesis de grupo |

---

## 🛠️ Para desarrolladores
Proyecto Vanilla HTML, CSS (tokens Material Design 3 + propiedades lógicas RTL) y módulos ES6 nativos — sin bundler ni dependencias de ejecución, bajo licencia GNU AGPL-3.0 (consulta [LICENSE](LICENSE)).

---

Licencia: AGPL-3.0 © 2026
