import { DISCORD_TOKEN } from "$env/static/private";
import type { PageServerLoad } from "./$types";

const discordMappings: Record<string, string> = {
  "794377681331945524": "Kendell R",
  "702627174112297013": "Ishita A",
  "1008896759814176768": "Adam D",
  "1179676237090783232": "Edward L",
  "835709580716802108": "Tobin H",
  "799485466109411328": "Nova S",
  "852619775099011114": "Tyler H",
  "929547663148478494": "Skyler T",
  "829164919362158592": "Jax R",
};

const replacePingsWithNames = (text: string): string => {
  return Object.entries(discordMappings).reduce((a, v) => {
    return a.replace(`<@${v[0]}>`, `<${v[1]}>`);
  }, text);
};

const read = async (id: string) => {
  const r = await fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
    headers: {
      authorization: `Bot ${DISCORD_TOKEN}`,
    },
  });
  if (!r.ok) {
    throw new Error(`Discord is ${r.status}ing`);
  }
  const data = (await r.json()) as any[];
  const parsed = data.map((m) => ({
    id: m.id,
    timestamp: new Date(m.timestamp),
    author: (m.webhook_id ? m.author.username : discordMappings[m.author.id]) || m.author.username,
    text: replacePingsWithNames(m.content),
    reply: m.message_reference
      ? {
          id: m.message_reference.message_id,
          text: replacePingsWithNames(
            data.find((x) => x.id == m.message_reference.message_id)?.content || "",
          ),
        }
      : undefined,
    announcement: false,
  }));
  parsed.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  return parsed;
};
export const load: PageServerLoad = async () => {
  return { messages: read("1382493404956721172") };
};
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get("username");
    if (!username) return;
    const content = formData.get("content");
    if (!content) return;

    const r = await fetch(
      "https://discord.com/api/webhooks/1388659480958603445/cb5Ir-CZew2OPSfB2jFYTYUMs8IZIYD0P3THlpW36ft9zMui4TEO30Nlw5xBgnkY7gFa?wait=true",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          content,
        }),
      },
    );
    if (!r.ok) throw new Error(`Discord is ${r.status}ing`);
  },
};
