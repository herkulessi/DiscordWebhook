# THIS IS VERY MUCH A WORK IN PROGRESS

And I do it only for fun. Dont expect this to run perfectly or at all. I am
fairly new to Javascript and by extension Typescript as well, constructive
criticism is very much apreciated.

## About this Project

This little hobby project aims to write a Deno library for using Discord
Webhooks. I plan to add every feature the API supports, but currently only
sending messages is possible. I try to make sure no API call ever returnes Bad
Request. That means, once the message gets formatted (at the latest) the library
should throw an Error if you did something wrong while constructing the message.
These limits are usually imposed by the Discord API documentation. Sometimes
this library is more restrictive than the Discord API, right now that only is
true for too long names where Discord might trim whitespaces in the middle of
the name on their end, while I only trim whitespaces with `String.trim()`.

## Usage:

At the current time, the Library is still pretty limited. Pretty much the only
thing it can do is sending Messages.

You first need to create a Webhook:

```TypeScript
import {
  DiscordWebhook,
  DiscordWebhookMessage,
} from "https://github.com/herkulessi/DiscordWebhook/DiscordWebhook.ts";
// discordWebhookUrl is the URL you get from Discord.
// I dont think this works for Application-owned webhooks.
let webhook = new DiscordWebhook(discordWebhookUrl);
```

The you can send messages. To do that, you need to create and Populate a
DiscordWebhookMessage object.

```TypeScript
import { DiscordWebhook, DiscordWebhookMessage } from "https://github.com/herkulessi/DiscordWebhook/DiscordWebhook.ts";
let message = new DiscordWebhookMessage()
    .setUsername('Override the Default name of the Webhook') // 32 Characters max (trimmed)
    .setAvatarUrl(new URL('http://example.com'))             // URL to the image, overrides default aatar
    .setContent('The normal Text in a Discord Message')      // 2000 Characters Max
    .useTts(true)                                            // Whether Discord should read out the message.
    .addEmbed(/*A Discord Embed Object*/);                   // Adds an embed to the Message
    .addEmbeds([/*Multiplle Discord Embed Objects*/])        // Adds multiple embeds to the Message
                                                             // Currently Embeds are not checked.
```

And finally send the message with:

```TypeScript
import {
  DiscordWebhook,
  DiscordWebhookMessage,
} from "https://github.com/herkulessi/DiscordWebhook/DiscordWebhook.ts";
webhook.executeWebhook(message);
```

if the Message would exceed 8 MiB, the executeWebhook function would throw an
Error.

Until I add File support, this should not be possible.
