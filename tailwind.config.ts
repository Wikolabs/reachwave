import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",500:"#f97316",600:"#ea580c",700:"#c2410c",900:"#7c2d12" }
      },
      fontFamily: { display:["'Fraunces'","serif"], body:["'Outfit'","sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
