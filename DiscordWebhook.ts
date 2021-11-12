// deno-lint-ignore-file camelcase
async function sleep(ms: number) {
  await new Promise((res) => {
    setTimeout(res, ms);
  });
}
export class DiscordWebhook {
  private url;
  private overrideName?: string;
  private linkToOverrideAvatar?: string;
  private f() {
    this.ready.then(() => {
      this.f();
    });
  }
  private queue: Array<WebhookRequest> = [];
  public ready: Promise<void>;
  // Bare API Calls
  executeWebhook(message: DiscordWebhookMessage) {
    let reso;
    const p = new Promise<Response>((res) => {
      reso = res;
    });
    this.fetch({
      url: this.url,
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: message.format(),
      },
      fun: reso,
    });
    return p;
  }
  // Internal Shit!
  fetch(request: WebhookRequest) {
    this.queue.push(request);
    this.f();
  }
  constructor(url: string) {
    this.url = url;
    this.ready = new Promise((res) => {
      this.fetcher(res);
    });
  }
  async fetcher(ready: () => void) {
    let p = new Promise<void>((res) => {
      this.f = res;
      ready();
    });
    while (true) {
      await p;
      p = new Promise<void>((res) => {
        this.f = res;
      });
      console.log(this.queue);
      let req = this.queue.shift();
      while (req) {
        const response = await fetch(req.url, req.options);
        if (req.fun) {
          req.fun(response);
        }
        if (response.status == 429) {
          this.queue.unshift(req);
          console.log("[");
          this.queue.forEach((e) => {
            console.log(e.options.body);
          });
          let wait: number = (await response.json()).retry_after;
          if (wait) {
            await sleep(wait);
          } else {
            if (response.headers.has("x-ratelimit-retry-after")) {
              wait = parseInt(
                "" + response.headers.get("x-ratelimit-retry-after"),
              );
              await sleep(wait * 1000);
            }
          }
        } else {
          if (!response.ok) {
            throw new Error(response.toString());
          } else {
            if (response.headers.has("x-ratelimit-remaining")) {
              if ("0" == "" + response.headers.get("x-ratelimit-remaining")) {
                if (response.headers.has("x-ratelimit-retry-after")) {
                  await sleep(
                    parseInt(
                      "" + response.headers.get("x-ratelimit-retry-after"),
                    ),
                  );
                }
              }
            }
          }
          req = this.queue.shift();
        }
      }
    }
  }
  // Creature Comforts!
  setCustomName(name?: string) {
    if (name) {
      this.overrideName = name.substring(0, Math.min(80, name.length));
    } else {
      this.overrideName = name;
    }
  }
  setCustomAvatar(url?: string) {
    this.linkToOverrideAvatar = url;
  }
}
type WebhookRequest = {
  url: string;
  options: RequestInit;
  fun?: (result: Response) => void;
};
export class DiscordWebhookMessage {
  private object: DiscordWebhookMessageObject = {
    username: undefined,
    avatar_url: undefined,
    content: undefined,
    embeds: undefined,
    tts: undefined,
    // TODO
    allowed_mentions: undefined,
    // Requires Application owned webhook.
    components: undefined,
    // Requires File Upload, not implemented!
    files: undefined,
    payload_json: undefined,
    attachments: undefined,
  };
  setContent(content: string) {
    if (content.length > 2000) {
      throw new Error(
        "Message: " + content + "\nis too long by " + (content.length - 2000),
      );
    }
    this.object.content = content;
    return this;
  }
  setUsername(username: string) {
    username = username.trim();
    if (username.length > 32) {
      throw new Error(
        "Username: " + username + "\nis too long by " + (username.length - 32),
      );
    }
    if (username.toUpperCase() == "CLYDE") {
      throw new Error(
        "Webhooks may not be called Clyde to stop phishing attacks, where a webhook impersonates the system webhook.",
      );
    }
    this.object.username = username;
    return this;
  }
  setAvatarUrl(avatar_url: URL) {
    this.object.avatar_url = avatar_url.toString();
    return this;
  }
  useTts(tts: boolean) {
    this.object.tts = tts;
    return this;
  }
  addEmbed(embed: DiscordWebhookEmbed) {
    if (!(this.object.embeds)) {
      this.object.embeds = new Array<DiscordWebhookEmbed>();
    }
    if (this.object.embeds.length >= 10) {
      throw new Error("Message already has the maximum number of embeds (10)");
    }
    this.object.embeds.push(embed);
    return this;
  }
  addEmbeds(embeds: Array<DiscordWebhookEmbed>) {
    for (const embed of embeds) {
      this.addEmbed(embed);
    }
    return this;
  }
  setAllowedMentiones() {
    throw "setAllowedMentiones is not yet implemented.";
  }
  addComponent() {
    throw "AApplicationWebhooks are required for components this and not yet supported.";
  }
  addComponents() {
    throw "ApplicationWebhooks are required for components this and not yet supported.";
  }
  addFile() {
    throw "Everything that needs a multipart/form-data is not yet implemented.";
  }
  addFiles() {
    throw "Everything that needs a multipart/form-data is not yet implemented.";
  }
  addAttachement() {
    throw "Everything that needs a multipart/form-data is not yet implemented.";
  }
  addAttacheents() {
    throw "Everything that needs a multipart/form-data is not yet implemented.";
  }
  format() {
    if (this.object.files || this.object.content || this.object.embeds) {
      const string = JSON.stringify(this.object);
      const encodedString = new TextEncoder().encode(string);
      if (encodedString.byteLength > 8388608) {
        throw new Error(
          "This Webhook Message exceeds Discords 8MiB Limit per request.",
        );
      }
      return encodedString;
    }
    throw new Error(
      "Webhook Messages need to contain at least ONE of the following: File, Embed, Content.",
    );
  }
}

type DiscordWebhookEmbed = Record<string, unknown>;
type DiscordWebhookMessageObject = {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: Array<DiscordWebhookEmbed>;
  tts?: boolean;
  // TODO
  allowed_mentions?: DiscordAllowedMentionsObject;
  // Requires Application owned webhook.
  components?: undefined;
  // Not Implemented, still reading up on multipart/form-data requests.
  files?: undefined;
  payload_json?: undefined;
  attachments?: undefined;
};
type DiscordAllowedMentionsObject = Record<string, unknown>;
