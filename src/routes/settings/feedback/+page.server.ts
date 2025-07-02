import { error } from "@sveltejs/kit";
import { FEEDBACK_WEBHOOK } from "$env/static/private";

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const feedback = formData.get("feedback") as string;
    if (!feedback) error(400);

    const message = feedback
      .trim()
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n")
      .slice(0, 2000);
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
  },
};
