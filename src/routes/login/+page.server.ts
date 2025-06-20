import { error } from "@sveltejs/kit";
import districts, { type SchoolDistrict } from "school-districts";
import type { PageServerLoad } from "./$types";
import studentvue from "$lib/api/studentvue";

const getDistrict = (email: string): SchoolDistrict | undefined => {
  const domain = email.split("@")[1];
  return districts[domain];
};
export const load: PageServerLoad = async ({ cookies }) => {
  const email = cookies.get("v2-email");
  if (!email) return { email: undefined };

  const canUsePassword = Boolean(getDistrict(email));
  return {
    email,
    canUsePassword,
    canUseFace: false, // TODO
  };
};
export const actions = {
  email: async ({ cookies, request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    if (typeof email != "string") error(400, "Bad email");

    cookies.set("v2-email", email, { path: "/", maxAge: 60 * 60 * 24 * 365 * 4 });
  },
  verifyFace: ({ request }) => {
    // TODO
  },
  verifyPassword: async ({ cookies, request }) => {
    const email = cookies.get("v2-email");
    if (!email) error(400, "No email");
    const id = email.split("@")[0];
    const district = getDistrict(email);
    if (!district) error(400, "Unknown district");

    const formData = await request.formData();
    const password = formData.get("password");
    if (typeof password != "string") error(400, "Bad password");

    const sv = district.apps.find((a) => a.app == "StudentVue");
    if (!sv) error(400, "District without StudentVue");

    const studentInfo = await studentvue(sv.host, id, password, "ChildList");
    const child = studentInfo.ChildList?.Child;

    // TODO: give them the JWT that will later be exchanged for storage and stuff
  },
};
