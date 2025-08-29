import type { Plugin } from "vite";

export default (): Plugin => {
  const addHeader = (req: any, res: any, next: any) => {
    const url = req?.url || "";
    if (url.includes("the-sw")) {
      res.setHeader("service-worker-allowed", "/");
    }
    next();
  };

  return {
    name: "service-worker-allowed-plugin",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(addHeader);
    },
    configurePreviewServer(server) {
      server.middlewares.use(addHeader);
    },
  };
};
