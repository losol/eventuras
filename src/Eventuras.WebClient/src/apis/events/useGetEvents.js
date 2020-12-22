import { useApi } from "../base"

export const useGetEvents = (path, options) => {
  if (!path) {
    throw new Error("Path is required")
  }

  const { data, error, loading } = useApi(path, options)

  return { data, error, loading }
}