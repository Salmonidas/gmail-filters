# Historial de Cambios (Changelog)

[English](CHANGELOG.md) | **Español**

Todos los cambios notables en este proyecto se documentarán en este archivo.
Este proyecto sigue el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [1.1.1] - 2026-03-13

### Añadido (Added)
- **Detección Automática de GitHub Sponsors**: Los botones de apoyo ahora consultan la API de GitHub en tiempo real al hacer clic. Si la página de Sponsors está activa, redirige; si no, muestra un aviso de "Donaciones Pausadas".
- **Aviso de Pausa Localizado**: Mensajes de toast bilingües (ES/EN) para informar sobre el estado de las donaciones.

### Modificado (Changed)
- **Pie de Página Minimalista**: Se ha eliminado el prefijo "Hecho con ♥" para un estilo más limpio, profesional y centrado en el Código Abierto.

### Eliminado (Removed)
- **Integración con PayPal**: Eliminados todos los enlaces y referencias a PayPal en favor de GitHub Sponsors.

## [1.1.0] - 2026-02-27

### Añadido (Added)
- **Compartir enlace**: Serializa el estado del constructor visual (condiciones, lógica, valores) en un fragmento Base64 compacto en la URL. Cualquier enlace compartido reconstruye automáticamente el filtro completo al cargarse.
- **Mis Filtros** (Biblioteca local guardada): El botón "Guardar filtro" almacena el nombre, la consulta y las condiciones del filtro actual en `localStorage`. Los filtros guardados aparecen como tarjetas sobre los ejemplos de fábrica y pueden cargarse o eliminarse de forma independiente.
- **Progressive Web App (PWA)**: Se añaden `manifest.json` y un Service Worker (`sw.js`). La aplicación es ahora completamente instalable en Android, iOS y macOS (vía Chrome o Safari con el nuevo panel de ayuda).
- **Biblioteca Modernizada**: Se ha renombrado la pestaña "Ejemplos" a "Biblioteca" y ahora integra tus filtros guardados.
- **Micro-animaciones**: Transiciones suaves en Diálogos (fade+scale), Snackbars (deslizamiento) y nuevas filas para una sensación premium.
- **Refinamientos UX**: Implementado un diálogo de "Confirmación de Borrado" para evitar pérdidas accidentales y un estado vacío premium para la Biblioteca.
- **Content Security Policy** estricta para bloquear XSS.
- Meta tags específicos para iOS para una experiencia 100% nativa.

### Corregido (Fixed)
- Implementadas y refactorizadas reglas CSS con Media Queries para lograr un diseño 100% responsivo en móviles (pestañas deslizables, tablas fluidas, protección estricta contra desbordamiento horizontal en pantallas pequeñas).

## [1.0.0] - 2026-02-25

### Añadido (Added)
- Constructor visual de condiciones con filas para añadir/eliminar, selector de tipo, campo de valor y botón para excluir (NOT).
- Selector de lógica de combinación Y (AND) / O (OR) entre condiciones, con generación de consultas adaptada al uso de paréntesis.
- Generación de consultas reales de Gmail en tiempo real a partir de las condiciones visuales.
- Resumen en lenguaje natural de la búsqueda generada.
- Botón para copiar la consulta al portapapeles con un solo clic.
- Botón "Abrir en Gmail" que rellena previamente la barra de búsqueda de Gmail con la consulta generada.
- Modo de editor avanzado: alternar entre el constructor visual y la entrada manual de texto de la consulta.
- Analizador básico de consultas (parser) para sincronizar cambios del editor avanzado al modo visual.
- Sección de Ejemplos con 5 filtros predefinidos listos para cargar en el constructor.
- Tabla de referencia en la sección Ayuda, con todos los operadores compatibles de Gmail y trucos útiles.
- Motor local de traducciones (i18n) simplificado usando `fetch` + un archivo JSON (sin dependencias externas).
- Archivos de idiomas Inglés (`en.json`) y Español (`es.json`).
- Detección automática de idioma del navegador mediante `navigator.language`.
- Selector de idioma en forma de menú desplegable en la barra superior.
- Navegación interna entre las secciones: Constructor, Ejemplos, Ayuda y Guía.
- Banner flotante (toast) pidiendo apoyo al proyecto (esquina inferior derecha, 5 s de retardo, botón "No volver a mostrar" usando `localStorage`).
- Botón ❤️ minimalista en la barra superior y enlace en el pie de página para apoyar al desarrollador.
- Sistema de diseño inspirado en Material Design 3 (con variables CSS personalizadas, tokens de color, sombras y formas).
- Diseño completamente responsivo adaptativo (móvil y escritorio).
- Estructura compatible con GitHub Pages (sin pasos de construcción, solo rutas relativas HTML/CSS/JS puro).
- Archivo `README.md` (y su versión `README-es.md`) con la guía de despliegue, la documentación y referencia de operadores.
- Modo Oscuro con detección automática del sistema operativo y configuración al vuelo.
- Botón para cambiar manualmente el modo claro/oscuro (☀️/🌙) en la barra superior, con persistencia gracias a `localStorage`.
- Estilo basado en los colores y paleta original de la marca Gmail: Primary `#4285F4`, Error `#EA4335`, Tertiary `#34A853`, Yellow `#FBBC04`.
- Botones de "Combinar con" que reflejan colores funcionales (Y = Amarillo, O = Azul) al estar activos.
- Archivo `.gitignore` con múltiples exclusiones para desarrollo limpio.
- Pestaña de "Guía" con un tutorial súper detallado de 7-pasos, enseñando cómo meter los filtros en Gmail para público no experto (incluye imágenes SVG incrustadas de los iconos reales del buscador).
- Botón de acceso directo llamado "¿Cómo aplicarlo?" que aparece mágicamente desde el constructor cuando introduces el texto para saltar rápidamente a los pasos enumerados.

### Modificado (Changed)
- Los viejos y sosos emojis de (☀️/🌙) que servían para hacer honor al modo Oscuro/Claro y a las Donaciones/Apoyo (❤️) se han reemplazado elegantemente con verdaderos y afilados gráficos vectoriales (SVG) de Material Design 3.
- Simplificados los links de apoyo a una única URL de soporte al desarrollador.
- Simplificado formalmente el final del sitio con los derechos de autor (el copyright se ha resumido concisamente con la leyenda `YYYY ©`).

### Eliminado (Removed)
- Sección "Preview" o "Vista previa" eliminada del menú principal. La caja de visualizaciones de consultas vive eternamente pegada dentro del Constructor Principal en la pantalla central de tu aplicación (Builder).

---

[1.1.1]: https://github.com/Salmonidas/gmail-filters/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/Salmonidas/gmail-filters/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Salmonidas/gmail-filters/releases/tag/1.0.0
