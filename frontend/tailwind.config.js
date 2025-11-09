/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // safelist যোগ করা হয়েছে যাতে আপনার থিমের সমস্ত ডাইনামিক ক্লাস বিল্ডের সময় অন্তর্ভুক্ত হয়
    safelist: [
      {
        pattern: /from-(blue|purple|amber|emerald|rose)-(500|600)/,
      },
      {
        pattern: /to-(blue|purple|amber|emerald|rose)-(500|600)/,
      },
      {
        pattern: /text-(blue|purple|amber|emerald|rose|green|orange|red)-(400|500|600|800)/,
      },
      {
        pattern: /bg-(blue|purple|amber|emerald|rose|green|red|yellow)-(100|500|600|900)\/20/,
      },
      {
        pattern: /bg-(blue|purple|amber|emerald|rose|green|red|yellow)-900\/30/,
      },
      {
        pattern: /border-(blue|purple|amber|emerald|rose)-(100|200|700|800)\/30/,
      },
      {
        pattern: /via-(blue|purple|amber|emerald|rose)-900\/20/,
      },
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }