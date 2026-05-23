import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeIQ — AI Resume Analyser",
  description:
    "Instantly understand how well your resume matches a job description with AI-powered scoring, skill gap analysis, and actionable suggestions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col relative">{children}</body>
    </html>
  );
}
