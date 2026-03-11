import "@/styles/globals.css";

export const metadata = {
  title: "ArchiveAI — Your LinkedIn voice, on autopilot",
  description: "Turn years of LinkedIn posts into an infinite content engine. Generate voice-matched posts in under 5 minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
