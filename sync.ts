import { parse as parseYaml } from "https://deno.land/std/encoding/yaml.ts"
import { parseFeed } from "https://deno.land/x/rss/mod.ts"
import * as utils from "./utils.ts"

const feeds = parseYaml(await Deno.readTextFile("./feeds.yml")) as {
  [language: string]: {
    [account: string]: {
      url: string
      encoding?: string
    }
  }
}

for (const [language, accounts] of Object.entries(feeds)) {
  for (const [account, options] of Object.entries(accounts)) {
    try {
      const [name, instance] = account.split("@")

      // Token
      const envName = `TOKEN_${`${name}_${instance}`.replace(/\./g, "_").toUpperCase()}`
      const token = Deno.env.get(envName)
      if (!token) {
        console.log(`No token for ${account} from ${envName}`)
        continue
      }

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
      let feed = feedData.entries.map(e => ({
        text: e.title?.value,
        url: e.links[0].href,
      }))

      // Get user ID
      const { id } = await utils.request(
        instance,
        "GET",
        `accounts/verify_credentials`,
        token,
      )

      // Get last status
      const [lastStatus] = await utils.request(
        instance,
        "GET",
        `accounts/${id}/statuses?limit=1&exclude_replies=true&exclude_reblogs=true`,
        token,
      )

      // Remove already posted statuses
      if (lastStatus) {
        for (let i = 0; i < feed.length; i++) {
          const entry = feed[i]
          if (!entry.url) continue
          let currentURL: string
          if (!lastStatus.card) {
            const url = lastStatus.content.match(/<a href="([^"]+)"/)
            if (!url) {
              throw new Error(`No card and no URL in status ${lastStatus.id}`)
            }
            currentURL = url[1]
          } else {
            currentURL = lastStatus.card.url
          }
          const redirectedURL = await utils.getRedirectedURL(entry.url)
          if (currentURL.startsWith(redirectedURL)) {
            feed = feed.slice(0, i)
            break
          }
        }
      }

      // Post statuses
      for (const entry of feed.reverse()) {
        const response = await utils.request(
          instance,
          "POST",
          `statuses`,
          token,
          JSON.stringify({
            status: `${entry.text ? (utils.decodeEntities(entry.text) + " ") : ""}${entry.url}`,
            visibility: "public",
            language: language,
          }),
        )
        console.log(account, entry, response.id)
      }
    } catch (error) {
      console.error("ERROR", account, error)
    }
  }
}
