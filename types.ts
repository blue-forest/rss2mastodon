
export interface Account {
  id: string
  username: string
  acct: string
  display_name: string
  locked: boolean
  bot: boolean
  discoverable: boolean
  group: boolean
  created_at: Date
  note: string
  url: string
  avatar: string
  avatar_static: string
  header: string
  header_static: string
  followers_count: number
  following_count: number
  statuses_count: number
  last_status_at: string
  noindex: boolean
  source: {
    privacy: string
    sensitive: boolean
    language?: any
    note: string
    fields: any[]
    follow_requests_count: number
  }
  emojis: any[]
  fields: any[]
  role: {
    id: string
    name: string
    permissions: string
    color: string
    highlighted: boolean
  }
}

export interface Status {
  id: string
  created_at: Date
  in_reply_to_id?: any
  in_reply_to_account_id?: any
  sensitive: boolean
  spoiler_text: string
  visibility: string
  language: string
  uri: string
  url: string
  replies_count: number
  reblogs_count: number
  favourites_count: number
  edited_at?: any
  favourited: boolean
  reblogged: boolean
  muted: boolean
  bookmarked: boolean
  pinned: boolean
  content: string
  filtered: any[]
  reblog?: any
  application: {
    name: string
    website: string
  }
  account: {
    id: string
    username: string
    acct: string
    display_name: string
    locked: boolean
    bot: boolean
    discoverable: boolean
    group: boolean
    created_at: Date
    note: string
    url: string
    avatar: string
    avatar_static: string
    header: string
    header_static: string
    followers_count: number
    following_count: number
    statuses_count: number
    last_status_at: string
    noindex: boolean
    emojis: any[]
    fields: any[]
  }
  media_attachments: any[]
  mentions: any[]
  tags: any[]
  emojis: any[]
  card: {
    url: string
    title: string
    description: string
    type: string
    author_name: string
    author_url: string
    provider_name: string
    provider_url: string
    html: string
    width: number
    height: number
    image: string
    embed_url: string
    blurhash: string
  }
  poll?: any
}
