/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        p3r: {
          blue:   "#0033BB",
          mid:    "#0044CC",
          bright: "#0055EE",
          vivid:  "#1A6FFF",
          dark:   "#001166",
          deeper: "#000D44",
          white:  "#FFFFFF",
          red:    "#FF1133",
          pink:   "#FF0088",
          cyan:   "#00DDFF",
          gold:   "#FFD700",
          black:  "#0A0A14",
        },
      },
      fontFamily: {
        display: ['"SKIP Std B"', '"Rodin Pro DB"', "sans-serif"],
        heading: ['"SKIP Std B"', "Oswald", "sans-serif"],
        grotesk: ['"SKIP Std B"', "Oswald", "sans-serif"],
        body:    ['"Rodin Pro DB"', "Karrik", "Inter", "sans-serif"],
        mono:    ['"Rodin Pro DB"', "monospace"],
      },
      animation: {
        "circle-pulse": "circle-pulse 4s ease-in-out infinite",
        "shimmer":      "shimmer 2.5s linear infinite",
        "slide-in":     "slide-in 0.4s ease-out forwards",
        "flicker":      "flicker 3s linear infinite",
      },
      keyframes: {
        "circle-pulse": {
          "0%,100%": { opacity: "0.85", transform: "translate(-50%,-50%) scale(1)" },
          "50%":     { opacity: "1",    transform: "translate(-50%,-50%) scale(1.03)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0"  },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)"      },
        },
        flicker: {
          "0%,95%,100%": { opacity: "1" },
          "96%":         { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
