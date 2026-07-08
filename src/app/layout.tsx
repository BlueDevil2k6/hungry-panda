import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hungry Panda — Order takeout",
  description:
    "Allergy-safe pan-Asian takeout ordering. Dumplings, bao, noodles & rice bowls — ordered your way.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
