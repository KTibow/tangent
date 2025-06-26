import type { IconifyIcon } from "@iconify/types";
import iconFiles from "@ktibow/iconset-material-symbols/files";
import iconSettings from "@ktibow/iconset-material-symbols/settings-rounded";

export type TangentApp = { name: string; url: string; icon: IconifyIcon };
export type TangentWindow = {
  app: TangentApp;
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
export default [
  {
    name: "Files",
    url: "/files",
    icon: iconFiles,
  },
  {
    name: "Settings",
    url: "/settings/about",
    icon: iconSettings,
  },
];
