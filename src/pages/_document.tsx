import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `(() => { try { var t = localStorage.getItem('theme'); var d = t === 'dark' || (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); if (d) { document.documentElement.classList.add('dark'); } } catch(e){} })();`
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}