import { XMLParser } from "fast-xml-parser";
import districts from "school-districts";

const build = (object: Record<string, string>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(object)) {
    params.set(key, value);
  }
  return params;
};
const parser = new XMLParser({ ignoreAttributes: false });

export const convertAuth = (auth: string | undefined) => {
  if (!auth) throw new Error("Sign in first.");

  const { email, password } = JSON.parse(auth);
  const [id, domain] = email.split("@");

  const district = districts[domain];
  if (!district) throw new Error(`Send feedback: request support for ${domain}.`);
  const host = district.apps.find((x) => x.app == "StudentVue")?.host;
  if (!host) throw new Error(`This needs StudentVue, and ${domain} doesn't have StudentVue.`);

  return [host, id, password] as const;
};
export default async (
  host: string,
  userID: string,
  password: string,
  name: string,
  params: Record<string, string> = {},
) => {
  const request = build({
    userID,
    password,
    skipLoginLog: "true",
    parent: "false",
    webServiceHandleName: "PXPWebServices",
    methodName: name,
    paramStr: `<Parms>${Object.keys(params)
      .map((key) => `<${key}>${params[key]}</${key}>`)
      .join("")}</Parms>`,
  });

  const response = await fetch(
    `https://${host}/Service/PXPCommunication.asmx/ProcessWebServiceRequest`,
    {
      method: "POST",
      body: request,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    },
  );
  const dataWrap = await response.text();
  const data = dataWrap
    .split(`<string xmlns="http://edupoint.com/webservices/">`)[1]
    .split("</string>")[0]
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const xml = parser.parse(data);
  const err = xml.RT_ERROR;
  if (err) {
    if (err["@_ERROR_MESSAGE"].startsWith("Invalid user id or password")) {
      throw new Error("Invalid auth");
    }
    throw new Error("StudentVue error");
  }

  return xml;
};
