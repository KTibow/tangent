import type { IconifyIcon } from "@iconify/types";
import iconWiki from "@ktibow/iconset-material-symbols/book-2-rounded";
import iconCode from "@ktibow/iconset-material-symbols/code-rounded";
import iconMessages from "@ktibow/iconset-material-symbols/comment-rounded";
import iconWeb from "@ktibow/iconset-material-symbols/language";
import iconHuman from "@ktibow/iconset-material-symbols/person-rounded";
import iconSettings from "@ktibow/iconset-material-symbols/settings-rounded";
import iconSchool from "@ktibow/iconset-material-symbols/source-environment-rounded";
const iconAi = {
  width: 24,
  height: 24,
  body: `<path fill="currentColor" d="m13 2a9.5 9.5 0 009 9 .5.5 0 010 2 9.5 9.5 0 00-9 9 .5.5 0 01-2 0 9.5 9.5 0 00-9-9 .5.5 0 010-2 9.5 9.5 0 009-9 .5.5 0 012 0"/>`,
};

export type TangentApp = {
  name: string;
  url: string;
  icon: IconifyIcon;
  requires?: "authorization" | "connection" | "verification";
  internal?: boolean;
};
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
    name: "School",
    url: "/school",
    icon: iconSchool,
    requires: "connection",
  },
  {
    name: "Web",
    url: "/web",
    icon: iconWeb,
    requires: "verification",
  },
  {
    name: "AI",
    url: "/ai",
    icon: iconAi,
    requires: "verification",
  },
  {
    name: "Chat",
    url: "/chat/discord",
    icon: iconMessages,
  },
  {
    name: "Wiki",
    url: "/wiki",
    icon: iconWiki,
  },
  {
    name: "Code",
    url: "/code",
    icon: iconCode,
  },
  {
    name: "Settings",
    url: "/settings/feedback",
    icon: iconSettings,
  },
  {
    name: "Authorization",
    url: "/authorization",
    icon: iconHuman,
    internal: true,
  },
  {
    name: "Verification",
    url: "/verification",
    icon: iconHuman,
    internal: true,
  },
] satisfies TangentApp[];
