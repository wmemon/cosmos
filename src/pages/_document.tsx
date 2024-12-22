import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
			<title key="title">Cosmos</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@100..900&display=swap"
        rel="stylesheet"
      ></link>
			<link rel="icon" type="image/svg+xml" href="/logo.svg" />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
