import { CHAT_WEBHOOK, DISCORD_KEY } from "$env/static/private";
import discord, { webhook } from "$lib/api/discord";
import type { PageServerLoad } from "./$types";

const discordMappings: Record<string, string> = {
  "1008896759814176768": "Adam D",
  "1258134607753117818": "Sumarth P",
  "1381764081056350271": "Noel G",
  "702627174112297013": "Ishita A",
  "794377681331945524": "Kendell R",
  "799485466109411328": "Nova S",
  "829164919362158592": "Jax R",
  "835709580716802108": "Tobin H",
  "852619775099011114": "Tyler H",
  "929547663148478494": "Skyler T",
  "957414292687298590": "Ewan A",
  "992851154327326750": "Edward K",
};

const replacePingsWithNames = (text: string): string => {
  return Object.entries(discordMappings).reduce((a, v) => {
    return a.replace(`<@${v[0]}>`, `<${v[1]}>`);
  }, text);
};

const read = async (id: string) => {
  const data: any[] = await discord(`channels/${id}/messages`);
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

    webhook(`${CHAT_WEBHOOK}?wait=true`, { username, content });
  },
};
