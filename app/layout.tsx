import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RescueGrid — Crisis Coordination & Live Graph Brain",
  description: "Disaster-response coordination platform powered by FalkorDB, Gemini, and Groq.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F7F5] text-[#111827] antialiased">
        {children}
      </body>
    </html>
  );
}
