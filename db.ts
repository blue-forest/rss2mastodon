import { DB } from "https://deno.land/x/sqlite/mod.ts"

export default function () {
  const db = new DB("data.sqlite")

  db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      url TEXT NOT NULL,
      account TEXT NOT NULL,
      post TEXT NOT NULL,
      date NUMERIC NOT NULL
    )
  `)

  console.log("Items before:", db.query("SELECT * FROM posts").length)

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
    close: () => {
      console.log("Items after:", db.query("SELECT * FROM posts").length)
      db.close()
    },
  }
}
