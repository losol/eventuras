import { defineNextLibConfig } from '@eventuras/vite-config/next-lib';

export default defineNextLibConfig({
  entry: {
    index: 'src/index.ts',
    session: 'src/session.ts',
    request: 'src/request.ts',
  },
});
