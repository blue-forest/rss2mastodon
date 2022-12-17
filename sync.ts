import { parse as parseYaml } from "https://deno.land/std/encoding/yaml.ts"
import { parseFeed } from "https://deno.land/x/rss/mod.ts"

const feeds = parseYaml(await Deno.readTextFile("./feeds.yml")) as {
  [language: string]: {
    [account: string]: string
  }
}

for (const [language, accounts] of Object.entries(feeds)) {
  for (const [account, url] of Object.entries(accounts)) {
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
      const feedResponse = await fetch(url)
      const feedXML = await feedResponse.arrayBuffer()
      const feedDecoder = new TextDecoder("iso-8859-1")
      const feedString = feedDecoder.decode(feedXML)
      const feedData = await parseFeed(feedString)
      let feed = feedData.entries.map(e => ({
        text: e.title?.value,
        url: e.links[0].href,
      }))

      // Get user ID
      const { id } = await request(
        instance,
        "GET",
        `accounts/verify_credentials`,
        token,
      )

      // Get last status
      const [lastStatus] = await request(
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
          const redirectedURL = await getRedirectedURL(entry.url)
          if (lastStatus.card.url.startsWith(redirectedURL)) {
            feed = feed.slice(0, i)
            break
          }
        }
      }

      // Post statuses
      for (const entry of feed.reverse()) {
        const response = await request(
          instance,
          "POST",
          `statuses`,
          token,
          JSON.stringify({
            status: `${entry.text ? (entry.text + " ") : ""}${entry.url}`,
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

async function getRedirectedURL(url: string) {
  const response = await fetch(url, { method: "HEAD" })
  return response.url
}

async function request(instance: string, method: string, path: string, token: string, body?: string) {
  const response = await fetch(`https://${instance}/api/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  })
  return response.json()
}

/*
[NOTES FOR THE AUTHORS] Token acquisition process (cannot be automated yet):
  1. https://mstdn.social/oauth/authorize?response_type=code&client_id=MAE02t6-yRbu1ArvaZaPiTDaUWLuZojFKjQDh2tFCb0&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read:accounts+read:statuses+write:statuses
  2. curl -X POST "https://mstdn.social/oauth/token?grant_type=authorization_code&code=$CODE&client_id=MAE02t6-yRbu1ArvaZaPiTDaUWLuZojFKjQDh2tFCb0&client_secret=$SECRET&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read:accounts+read:statuses+write:statuses"
*/
