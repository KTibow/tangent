import { error } from "@sveltejs/kit";
import { FEEDBACK_WEBHOOK } from "$env/static/private";
import { webhook } from "$lib/api/discord";

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
    await webhook(FEEDBACK_WEBHOOK, { content: message });
  },
};
