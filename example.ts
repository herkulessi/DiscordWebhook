import {
  DiscordWebhook,
  DiscordWebhookMessage,
} from "https://github.com/herkulessi/DiscordWebhook/DiscordWebhook.ts";
// Replace the URL with your own. But keep it scret!
// I dont think this works for Application-owned webhooks.
let webhook = new DiscordWebhook(
  "https://discord.com/api/webhooks/<webhook_id>/<webhook_token>",
);

let message = new DiscordWebhookMessage()
  .setUsername("Override the Default name of the Webhook") // 32 Characters max (trimmed)
  .setAvatarUrl(new URL("http://example.com")) //             URL to the image, overrides default aatar
  .setContent("The normal Text in a Discord Message") //      2000 Characters Max
  .useTts(true); //                                           Whether Discord should read out the message.
//.addEmbed(/*A Discord Embed Object*/);                   // Adds an embed to the Message
//.addEmbeds([/*Multiplle Discord Embed Objects*/])        // Adds multiple embeds to the Message
//                                                            Currently Embeds are not checked.

webhook.executeWebhook(message);
