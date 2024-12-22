import Head from "next/head";

const DOMAIN = "";
const DEFAULT_OG_IMAGE = "";

interface SeoHeadProps {
	title?: string;
	description: string;
	siteName?: string;
	canonical?: string;
	ogImage?: string;
	ogType?: string;
	twitterHandle?: string;
}

export function SeoHead({
	title = "",
	description = "Enter the Cosmos",
	siteName = "Cosmos",
	canonical = DOMAIN,
	ogImage = DEFAULT_OG_IMAGE,
	ogType = "website",
	twitterHandle = "",
}: SeoHeadProps) {
	return (
		<Head>
			<title key="title">{ title ? `${title} | ${siteName}` : siteName}</title>
			<meta name="description" content={description} />
			<meta name="keywords" content="" />
			<meta key="og_type" property="og:type" content={ogType} />
			<meta key="og_title" property="og:title" content={title} />
			<meta key="og_description" property="og:description" content={description} />
			<meta key="og_locale" property="og:locale" content="en_IE" />
			<meta key="og_site_name" property="og:site_name" content={siteName} />
			<meta key="og_url" property="og:url" content={canonical ?? DOMAIN} />
			<meta key="og_site_name" property="og:site_name" content={siteName} />
			<meta key="og_image" property="og:image" content={ogImage ?? DEFAULT_OG_IMAGE} />
			<meta key="og_image:alt" property="og:image:alt" content={`${title} | ${siteName}`} />
			<meta key="og_image:width" property="og:image:width" content="1200" />
			<meta key="og_image:height" property="og:image:height" content="630" />

			<meta name="robots" content="index,follow" />

			<meta key="twitter:card" name="twitter:card" content="summary_large_image" />
			<meta key="twitter:site" name="twitter:site" content={twitterHandle} />
			<meta key="twitter:creator" name="twitter:creator" content={twitterHandle} />
			<meta key="twitter:title" property="twitter:title" content={title} />
			<meta key="twitter:description" property="twitter:description" content={description} />

			<link rel="canonical" href={canonical ?? DOMAIN} />

			<link rel="icon" type="image/svg+xml" href="/logo.svg" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
		</Head>
	);
}
