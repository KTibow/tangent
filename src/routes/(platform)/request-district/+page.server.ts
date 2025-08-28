import { error } from "@sveltejs/kit";
import { FEEDBACK_WEBHOOK } from "$env/static/private";
import { webhook } from "$lib/api/discord";

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const domain = formData.get("domain") as string;
    if (!domain) error(400);

    const message = `> Add support for ${domain}`;
    webhook(FEEDBACK_WEBHOOK, { content: message });

    return { sent: true };
  },
};
