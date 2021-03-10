import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
    providers: [
      Providers.Google({
        clientId: '718499315989-dvl9h41vb5lg0u78gvi00t6fuqmgdsv9.apps.googleusercontent.com',
        clientSecret: 'Hddl3Z3c370NmUSifB4c6j_P',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code'
      }),
    ],
})