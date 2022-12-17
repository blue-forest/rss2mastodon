import { parse as parseYaml } from "https://deno.land/std/encoding/yaml.ts"
import { parseFeed } from "https://deno.land/x/rss/mod.ts"

const feeds = parseYaml(await Deno.readTextFile("./feeds.yml")) as {
  [language: string]: {
    [account: string]: string
  }
}

for (const [language, accounts] of Object.entries(feeds)) {
  for (const [account, url] of Object.entries(accounts)) {
    const [name, instance] = account.split("@")
    const envName = `TOKEN_${`${name}_${instance}`.replace(/\./g, "_").toUpperCase()}`
    const token = Deno.env.get(envName)
    if (!token) {
      console.log(`No token for ${account} from ${envName}`)
      continue
    }

    // Get feed
    const feedResponse = await fetch(url)
    const feedXML = await feedResponse.text()
    let feed = (await parseFeed(feedXML)).entries.map(e => ({
      text: e.title?.value,
      url: e.links[0].href,
    }))

    // Get user ID
    const credentialsResponse = await fetch(
      `https://${instance}/api/v1/accounts/verify_credentials`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const { id } = await credentialsResponse.json()

    // Get last status
    const lastStatusResponse = await fetch(
      `https://${instance}/api/v1/accounts/${id}/statuses?limit=1&exclude_replies=true&exclude_reblogs=true`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const [lastStatus] = await lastStatusResponse.json()

    // Remove already posted statuses
    if (lastStatus) {
      const lastURLIndex = feed.findIndex(e => e.url === lastStatus.card.url)
      if (lastURLIndex !== -1) feed = feed.slice(0, lastURLIndex)
    }

    for (const entry of feed.reverse()) {
      const response = await fetch(`https://${instance}/api/v1/statuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: `${entry.text} ${entry.url}`,
          visibility: "public",
          language: language,
        }),
      })
      console.log(account, entry, response.status)
    }
  }
}

/*
[NOTES FOR THE AUTHORS] Token acquisition process (cannot be automated yet):
  1. https://toot.aquilenet.fr/oauth/authorize?response_type=code&client_id=645xncPGFQLlgRSE-GUJKKupk732BuYNLbC0AwUnflY&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read:accounts+read:statuses+write:statuses
  2. curl - X POST "https://toot.aquilenet.fr/oauth/token?grant_type=authorization_code&code=$CODE&client_id=645xncPGFQLlgRSE-GUJKKupk732BuYNLbC0AwUnflY&client_secret=$SECRET&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read:accounts+read:statuses+write:statuses"
*/
