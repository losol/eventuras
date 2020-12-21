import Document, { Head, Html, Main, NextScript } from 'next/document';
import NavBar from '../src/components/NavBar/NavBar';

export default class extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head >
          <title>Eventuras</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <NavBar />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
