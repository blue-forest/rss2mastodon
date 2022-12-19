import { DB } from "https://deno.land/x/sqlite/mod.ts"

export default function () {
  const db = new DB("data.sqlite")

  db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      url TEXT PRIMARY KEY,
      account TEXT NOT NULL,
      post TEXT NOT NULL,
      date NUMERIC NOT NULL,
      UNIQUE (url, account)
    )
  `)

  return {
    exists: (url: string) => {
      return db.query(
        `SELECT url FROM posts WHERE url = :url`,
        { url },
      ).length > 0
    },
    add: (url: string, account: string, post: string) => {
      db.query(
        `INSERT INTO posts (url, account, post, date) VALUES (:url, :account, :post, :date)`,
        { url, account, post, date: Date.now() },
      )
    },
    close: () => db.close(),
  }
}
