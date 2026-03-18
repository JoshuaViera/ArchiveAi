import "@/styles/globals.css";

export const metadata = {
  title: "ArchiveAI — Your LinkedIn voice, on autopilot",
  description: "Turn years of LinkedIn posts into an infinite content engine. Upload your archive, learn your voice, and generate posts that sound exactly like you.",
  openGraph: {
    title: "ArchiveAI — Your LinkedIn voice, on autopilot",
    description: "Turn years of LinkedIn posts into an infinite content engine. Upload your archive, learn your voice, and generate posts that sound exactly like you.",
    siteName: "ArchiveAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchiveAI — Your LinkedIn voice, on autopilot",
    description: "Turn years of LinkedIn posts into an infinite content engine.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
