# Historial de Cambios (Changelog)

[English](CHANGELOG.md) | **Español**

Todos los cambios notables en este proyecto se documentarán en este archivo.
Este proyecto sigue el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

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
- Botón ❤️ minimalista en la barra superior y enlace en el pie de página para donaciones (ambos apuntando a PayPal.me).
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
- Simplificados los links con peticiones de donación al URL PayPal.me público de `SalmonidasDEV`.
- Simplificado formalmente el final del sitio con los derechos de autor (el copyright se ha resumido concisamente con la leyenda `YYYY ©`).

### Eliminado (Removed)
- Sección "Preview" o "Vista previa" eliminada del menú principal. La caja de visualizaciones de consultas vive eternamente pegada dentro del Constructor Principal en la pantalla central de tu aplicación (Builder).

---

[1.0.0]: https://github.com/Salmonidas/gmail-filters/releases/tag/1.0.0
