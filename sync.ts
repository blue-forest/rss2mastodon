import { parse as parseYaml } from "https://deno.land/std/encoding/yaml.ts"
import { parseFeed } from "https://deno.land/x/rss/mod.ts"
import * as utils from "./utils.ts"
import DB from "./db.ts"
import { Status } from "./types.ts"

const feeds = parseYaml(await Deno.readTextFile("./feeds.yml")) as {
  [language: string]: {
    [account: string]: {
      url: string
      encoding?: string
    }
  }
}

const database = DB()

for (const [language, accounts] of Object.entries(feeds)) {
  for (const [account, options] of Object.entries(accounts)) {
    try {
      const [name, instance] = account.split("@")

      // Token
      const envName = `TOKEN_${`${name}_${instance}`.replace(/\./g, "_").toUpperCase()}`
      const token = Deno.env.get(envName)
      if (!token) {
        console.warn(`[WARNING] No token for ${account}, skipping`)
        continue
      }

      console.log("[ACCOUNT] Syncing", account, "...")

      // Get feed
      const feedResponse = await fetch(options.url)
      let feedString: string
      if (typeof options.encoding !== "undefined") {
        const feedXML = await feedResponse.arrayBuffer()
        const feedDecoder = new TextDecoder(options.encoding)
        feedString = feedDecoder.decode(feedXML)
      } else {
        feedString = await feedResponse.text()
      }
      const feedData = await parseFeed(feedString)
      const feed = feedData.entries.map(e => ({
        text: e.title?.value,
        url: e.links[0].href,
      }))

      // Get user ID (not used anymore)
      /*const { id } = await utils.request(
        instance,
        "GET",
        `accounts/verify_credentials`,
        token,
      )*/

      // Get last status (not used anymore)
      /*const [lastStatus] = await utils.request(
        instance,
        "GET",
        `accounts/${id}/statuses?limit=1&exclude_replies=true&exclude_reblogs=true`,
        token,
      )*/

      // Remove already posted statuses (not used anymore)
      /*if (lastStatus) {
        for (let i = 0; i < feed.length; i++) {
          const entry = feed[i]
          if (!entry.url) continue
          let currentURL: string
          if (lastStatus.card) {
            currentURL = lastStatus.card.url
          } else {
            const url = lastStatus.content.match(/<a href="([^"]+)"/)
            if (!url) {
              throw new Error(`No card and no URL in status ${lastStatus.id}`)
            }
            currentURL = url[1]
          }
          const redirectedURL = await utils.getRedirectedURL(entry.url)
          if (currentURL.startsWith(redirectedURL)) {
            feed = feed.slice(0, i)
            break
          }
        }
      }*/

      // Post statuses
      for (const entry of feed.reverse()) {
        if (!entry.url) continue
        //entry.url = await utils.getRedirectedURL(entry.url) // Not needed anymore
        //if (!entry.url) continue
        if (database.exists(entry.url)) continue
        /*const response = await utils.request<Status>(
          instance,
          "POST",
          `statuses`,
          token,
          JSON.stringify({
            status: `${entry.text ? (utils.decodeEntities(entry.text) + " ") : ""}${entry.url}`,
            visibility: "public",
            language,
          }),
        )*/
        console.log("[POST]", account, entry)
        database.add(entry.url, account, "skipped")//response.id)
      }
    } catch (error) {
      console.error("[ERROR]", account, error)
    }
  }
}

database.close()
