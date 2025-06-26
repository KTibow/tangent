import type { IconifyIcon } from "@iconify/types";
import iconSettings from "@ktibow/iconset-material-symbols/settings-rounded";

export type TangentApp = { name: string; url: string; icon: IconifyIcon };
export default [
  {
    name: "Settings",
    url: "/settings/about",
    icon: iconSettings,
  },
];
