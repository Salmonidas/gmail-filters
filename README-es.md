# Creador de Filtros de Gmail (Gmail Filter Builder)

[English](README.md) | **Español**

> Herramienta visual para construir búsquedas avanzadas de Gmail de forma visual. Genera la consulta lista para copiar, explica el filtro en lenguaje natural y funciona al 100% en el navegador. Sin backend, sin dependencias. EN/ES.

[![Usar ahora - Live Demo](https://img.shields.io/badge/Usar_Ahora-Live_Demo-blue?logo=googlechrome)](https://salmonidas.github.io/gmail-filters/)

---

## 🛑 El problema de Gmail
El buscador de Gmail es muy potente, pero crear filtros complejos (ej: "Correos con adjuntos, que no sean de X persona, que tengan la etiqueta Y") requiere aprender de memoria una lista de comandos y símbolos como `has:attachment -from:jefe@empresa.com label:urgente`. ¡Nadie tiene tiempo para memorizar eso!

## ✨ La solución
**Gmail Filter Builder** es una herramienta gratuita y segura que funciona en tu navegador. Con ella puedes crear estas búsquedas complejas simplemente usando menús desplegables.

1. **Añade tus reglas:** Selecciona qué quieres filtrar (Remitente, Asunto, Tiene adjuntos, Fecha...).
2. **Copia el resultado:** La herramienta genera el código exacto de Gmail al instante.
3. **Pégalo en Gmail:** Usa el botón "Abrir en Gmail" para probar tu búsqueda directamente en tu bandeja de entrada o para crear un filtro automático definitivo con ella.

---

## 🚀 Características principales
- **Interfaz visual:** Añade tantas condiciones como necesites, pulsa botones para combinarlas con lógica "Y / O", o marca la casilla "Excluir" para indicar detalladamente lo que NO quieres.
- **Traducción al instante:** Según construyes el filtro, la web te escribe un resumen en lenguaje normal explicándote exactamente qué correos van a coincidir.
- **Privacidad total e inquebrantable:** No requiere contraseñas, no se conecta a tu cuenta de Google y funciona 100% en local dentro de tu propio navegador. Tus datos están perfectamente seguros.
- **Guía paso a paso integrada:** Incluye una pestaña de "Guía" con capturas de pantalla integradas que te enseñan paso a paso dónde y cómo configurar el filtro en la web de Gmail.
- **Filtros de Ejemplo cargables:** Carga las típicas configuraciones maestras útiles (ej: "Limpiar boletines pesados") con un solo clic.

---

## 📚 Operadores que cubrimos
Con esta herramienta puedes filtrar a nivel pro por:

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

## 🛠️ Para desarrolladores
Si eres programador y quieres alojar tu propia versión del portal, ayudar en el código subyacente (creado al vuelo con HTML/JS/CSS vainilla y sin framework) o quieres curiosear en el sistema manual para los lenguajes dinámicos... ¡el código fuente es todo tuyo bajo licencia MIT! Simplemente clona este repositorio en tu terminal y siéntete como en casa.

---

Licencia: MIT © 2026
