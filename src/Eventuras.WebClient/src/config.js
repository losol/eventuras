export const config = {
  /**
   * This value is arbitrary and used when making GQL queries to AppSync.
   */
  app: {
    name: '',
    companyName: '',
    absoluteUrl: '',
  },
  meta: {
    title: '',
  },
  auth: {
    REACT_DOMAIN: process.env.REACT_DOMAIN,
    REACT_CLIENT_ID: process.env.REACT_CLIENT_ID
  },
  api: {
    baseUrl: process.env.REACT_APP_SERVER_API_URL
  }
}
