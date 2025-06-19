import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // TODO: parse out email from cookies and send it to the client
  // TODO: figure out whether we can simplify the old tangent flow
};
export const actions = {
  email: async ({ cookies, request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    if (typeof email != "string") error(400, "Bad email");

    cookies.set("v2-email", email, { path: "/", maxAge: 60 * 60 * 24 * 365 * 4 });
  },
};
