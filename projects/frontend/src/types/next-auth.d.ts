import 'next-auth';

declare module 'next-auth' {
  export interface Session {
    user: {
      name: string;
      email: string;
      image?: string;
      id: string;
    };
    accessToken?: string;
    roles: string[];
    expires: string;
  }
}
