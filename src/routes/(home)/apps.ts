import type { IconifyIcon } from "@iconify/types";
import iconFeedback from "@ktibow/iconset-material-symbols/feedback-rounded";

export type TangentApp = { name: string; url: string; icon: IconifyIcon };
export default [
  {
    name: "Feedback",
    url: "/feedback",
    icon: iconFeedback,
  },
];
