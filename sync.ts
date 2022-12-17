import { parse as parseYaml } from "https://deno.land/std/encoding/yaml.ts"
import { parseFeed } from "https://deno.land/x/rss/mod.ts"

const feeds = parseYaml(await Deno.readTextFile("./feeds.yml")) as {
  [language: string]: {
    [account: string]: string
  }
}

for (const [language, accounts] of Object.entries(feeds)) {
  for (const [account, url] of Object.entries(accounts)) {
    const token = Deno.env.get(`TOKEN_${account.replace(/@|\./g, "_")}`)
    console.log(`TOKEN_${account.replace(/@|\./g, "_")}`, token)
    if (!token) continue
    const response = await fetch(url)
    const xml = await response.text()
    const feed = await parseFeed(xml)
    for (const entry of feed.entries) {
      const response = await fetch("https://toot.aquilenet.fr/api/v1/statuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get(`TOKEN_${account}`)}`,
        },
        body: JSON.stringify({
          status: `${entry.title?.value} ${entry.id}`,
          visibility: "public",
          language: language,
        }),
      })
      console.log(account, response.status)
      break
    }
  }
}

/*
[NOTES FOR THE AUTHORS] Token acquisition process (cannot be automated yet):
  1. https://toot.aquilenet.fr/oauth/authorize?response_type=code&client_id=645xncPGFQLlgRSE-GUJKKupk732BuYNLbC0AwUnflY&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read:accounts+read:statuses+write:statuses
  2. curl - X POST "https://toot.aquilenet.fr/oauth/token?grant_type=authorization_code&code=$CODE&client_id=645xncPGFQLlgRSE-GUJKKupk732BuYNLbC0AwUnflY&client_secret=$SECRET&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read:accounts+read:statuses+write:statuses"
*/
