# Creador de Filtros de Gmail (Gmail Filter Builder)

[English](README.md) | **Español**

> Construye búsquedas avanzadas de Gmail de forma visual — sin necesidad de memorizar la sintaxis.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?logo=github)](https://salmonidas.github.io/gmail-filters/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ¿Qué es esto?

**Gmail Filter Builder** es una aplicación web estática de código abierto y gratuita que te ayuda a construir potentes consultas de búsqueda en Gmail utilizando una interfaz visual y sin código (no-code).

En lugar de tener que memorizar la difícil sintaxis de los operadores de Gmail, simplemente seleccionas las condiciones de filtrado en diferentes menús desplegables, rellenas sus valores, y la herramienta genera la consulta correcta en tiempo real — lista para que la copies y pegues en la barra de búsqueda de Gmail o en el asistente de creación de filtros.

---

## Características (Features)

- 🔍 **Constructor visual de condiciones** — añade/elimina filas, cada una con un selector de tipo, un valor de entrada y un interruptor para excluir (NOT).
- 🔗 **Lógica Y / O (AND / OR)** — combina tus condiciones mediante declaraciones implícitas Y, o con conjunciones formales O.
- 📋 **Copiar con un clic** — un botón para copiar la consulta directamente al portapapeles.
- 🔗 **Abrir en Gmail** — salta directamente a tu cuenta de Gmail con la consulta previamente rellenada en el buscador.
- 💬 **Resumen en lenguaje natural** — mira una explicación humana y legible de lo que hace el filtro.
- 🛠️ **Editor avanzado** — cambia rápidamente al modo de edición en texto plano (raw query) y vuelve de nuevo al modo visual.
- 🌍 **Internacionalizado (i18n)** — completamente traducido, se envía con idiomas Inglés y Español por defecto y es muy fácil de ampliar.
- ⭐ **Ejemplos predefinidos** — incluye 5 filtros prediseñados de muestra listos para cargar en el constructor y poder adaptarlos.
- 📖 **Referencia de Operadores** — tabla de ayuda incorporada con todos los operadores soportados por Gmail.

---

## Operadores de Gmail Compatibles

| Operador | Descripción |
|---|---|
| `from:` | Remitente (dirección origen) |
| `to:` | Destinatario principal |
| `cc:` / `bcc:` | Destinatarios en CC / CCO (Copia oculta) |
| `subject:` | Línea de asunto |
| `has:attachment` | Contiene algún archivo adjunto |
| `filename:` | Nombre del archivo adjunto o extensión |
| `label:` | Etiqueta de Gmail |
| `in:` | Carpeta / categoría (recibidos, spam, promociones…) |
| `is:read` / `is:unread` | Estado de lectura (leído / no leído) |
| `is:starred` / `is:important` | Estado de relevancia (estrella / marca de importante) |
| `after:` / `before:` | Rango de fechas absolutas (AAAA/MM/DD) |
| `newer_than:` / `older_than:` | Rango de fechas relativas (1d, 2m, 1y) |
| `larger:` / `smaller:` | Tamaño del mensaje |
| `OR` | Lógica de unión O |
| `-término` | Excluir / NOT |
| `(…)` | Agrupación |

---

## Estructura del Proyecto

```
gmail-filters/
├── index.html               # Esqueleto Single-page app 
├── assets/
│   ├── css/
│   │   └── styles.css       # Hoja de estilos basada en Material Design 3
│   └── js/
│       ├── main.js          # Punto de entrada — arranca el i18n y enlaza el sistema
│       ├── i18n.js          # Motor ligero de traducciones (fetch + JSON)
│       ├── query-builder.js # Funciones puras de construcción (stateless)
│       ├── ui.js            # Manipulación y eventos de toda la capa DOM (UI/UX)
│       └── examples.js      # Información de ejemplos prestablecidos y su renderizador
├── locales/
│   ├── en.json              # Módulo de texto Inglés
│   └── es.json              # Módulo de texto Español
└── Utilidades/              # Documentación e historia local (solo para desarrollo)
    ├── Contexto_Global.md
    ├── Roadtrip.txt
    ├── Funcional.txt
    └── Commit.txt
```

---

## Despliegue en GitHub Pages

1. Haz un Fork o clona este repositorio en tu cuenta.
2. Realiza un push hacia `main` (o tu rama principal elegida por defecto).
3. Entra en las opciones de **Settings → Pages** y establece el origen del deployment en la rama `main` / sobre la carpeta `(root)`.
4. El sitio ya estará público, vivo y accesible en una dirección URL parecida a `https://salmonidas.github.io/gmail-filters/`.

No se precisan pasos de construcción intermedios (Build step). Se envía directamente como un proyecto puramente en HTML/CSS/JS clásico.

---

## Agregando un Nuevo Idioma

1. Copia de base el molde del achivo inglés `locales/en.json` → y dale nombre al nuevo, ejemplo francés `locales/fr.json`.
2. Conserva estrictamente y mantiene siempre intactas las claves principales de diccionario JSON y traduce únicamente los valores descriptivos en el string derecho.
3. Abre el archivo principal del motor `assets/js/i18n.js` y expón este nuevo locale registrado metiéndolo manualmente al objeto array `AVAILABLE_LOCALES`:
   ```js
   { code: 'fr', label: 'Français' },
   ```
4. Y listo, ¡mágicamente el nuevo campo y banderola surgirá elegible del menú de idiomas superior principal en la interfaz!

---

## Añadiendo Nuevos Tipos de Condiciones

1. Edita el archivo `assets/js/query-builder.js` para crear e inscribir una entrada lógica dentro del esquema central de operadores preexistente `CONDITION_TYPES`.
2. Da de alta localmente las traducciones requeridas mediante un par de claves llamadas `builder.types.<key>` (para rotular el selector de menús) y `builder.placeholders.<key>` en la caja y los inputs de cada archivo json.
3. Inserta por igual la descripción contextual del resumen (en lenguaje natural) bajo el atributo namespace de variables `summary.<key>` dentro los locales.

---

## Configurando el Banner de Soporte a Desarrolladores

Date un rodeo por `assets/js/main.js` y edita la constante bandera superior `CONFIG`:

```js
const CONFIG = {
  HIDE_SUPPORT: false,   // ajusta valor booleano a true para bloquear / ocultar universalmente el mensaje persistente central "Support banner".
};
```

Para modificar el anclaje a las donaciones modifica las urls en la clave interna `support.links[]` dentro del respectivo local.

---

## Licencia / Distribución Legal M.I.T

MIT © 2026 — consulta y lee a fondo el documento adjunto [LICENSE](LICENSE).
