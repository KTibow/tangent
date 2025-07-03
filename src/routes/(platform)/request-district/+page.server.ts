import { error } from "@sveltejs/kit";
import { FEEDBACK_WEBHOOK } from "$env/static/private";

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const domain = formData.get("domain") as string;
    if (!domain) error(400);

    const message = `> Add support for ${domain}`;
    const r = await fetch(FEEDBACK_WEBHOOK, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
    if (!r.ok) throw new Error(`Discord is ${r.status}ing`);

    return { sent: true };
  },
};
