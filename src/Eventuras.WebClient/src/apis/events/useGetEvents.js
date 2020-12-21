import useSWR from "swr"
import { baseUrl, fetcher } from "../config"

export const useGetEvents = path => {
  if (!path) {
    throw new Error("Path is required")
  }

  console.log("base url", baseUrl)

  const url = baseUrl + path

  const { data: events, error } = useSWR(url, fetcher)

  return { events, error }
}