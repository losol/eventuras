export const fetcher = url => fetch(url).then(res => res.json())
export const baseUrl = process.env.REACT_APP_SERVER_API_URL || ''