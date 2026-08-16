import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [uni()],
    define: {
      __ZUJI_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || ""),
    },
  };
});
