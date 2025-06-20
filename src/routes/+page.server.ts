import { JWT_KEY } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import { verify } from "@tsndr/cloudflare-worker-jwt";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const jwt = cookies.get("v2-jwt");
  if (!jwt || !(await verify(jwt, JWT_KEY))) redirect(307, "/login");
  return { jwt };
};
