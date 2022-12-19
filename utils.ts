
export async function getRedirectedURL(url: string) {
  const response = await fetch(url, { method: "HEAD" })
  return response.url
}

export async function request<Output = any>(instance: string, method: string, path: string, token: string, body?: string): Promise<Output> {
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

const entitiesRegex = /&(nbsp|amp|quot|lt|gt|euro);/g

const entitiesConversions: { [input: string]: string } = {
  "nbsp": " ",
  "amp": "&",
  "quot": "\"",
  "lt": "<",
  "gt": ">",
  "euro": "€",
}

export function decodeEntities(encodedString: string): string {
  return encodedString
    .replace(entitiesRegex, (_, entity: string) => {
      return entitiesConversions[entity]
    })
    .replace(/&#(\d+);/gi, (_, numStr) => {
      return String.fromCharCode(parseInt(numStr, 10))
    })
}

