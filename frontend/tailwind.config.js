/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A", // Azul oscuro (ejemplo)
        secondary: "#9333EA", // Morado (ejemplo)
        accent: "#F59E0B", // Amarillo (ejemplo)
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Tipografía principal
        serif: ["Merriweather", "serif"], // Tipografía secundaria
      },
      spacing: {
        128: "32rem", // Espaciado personalizado
        144: "36rem",
      },
      borderRadius: {
        xl: "1.5rem", // Bordes redondeados adicionales
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Mejora los estilos de formularios
    require("@tailwindcss/typography"), // Para un mejor diseño de textos largos
    require("@tailwindcss/aspect-ratio"), // Para controlar proporciones
  ],
};
