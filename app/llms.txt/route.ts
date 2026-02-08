import { NextResponse } from "next/server";

function absoluteUrl(path: string, siteUrl: string) {
  return new URL(path, siteUrl).toString();
}

function buildLlmsText(siteUrl: string) {
  return `# BridgeMind

Machine-readable sitemaps: ${absoluteUrl("/sitemap.xml", siteUrl)} | ${absoluteUrl("/llms.txt", siteUrl)}

> BridgeMind is the premier vibe coding and agentic coding platform. We empower developers to build production-ready software using natural-language programming with AI tools like Cursor, Claude Code, GitHub Copilot, and Windsurf.

BridgeMind provides resources, tools, and a thriving community for developers embracing vibe coding and agentic coding workflows. Our mission is to accelerate the adoption of AI-powered development practices worldwide.

## Core Pages

- [Home](${absoluteUrl("/", siteUrl)}): Discover vibe coding and join the agentic coding revolution
- [About BridgeMind](${absoluteUrl("/about", siteUrl)}): Our mission, vision, and approach to vibe coding and agentic coding
- [Pricing](${absoluteUrl("/pricing", siteUrl)}): Membership plans and platform access

## Resources

- [Blog](${absoluteUrl("/blog", siteUrl)}): Articles on vibe coding, agentic coding, prompt engineering, and AI development best practices

## Community

- [Discord Community](${absoluteUrl("/discord", siteUrl)}): Join 20,000+ vibe coders in our developer community

## Company

- [Contact](${absoluteUrl("/contact", siteUrl)}): Get in touch with the BridgeMind team

## Optional

- [Terms of Service](${absoluteUrl("/terms-of-service", siteUrl)}): Legal terms and conditions
- [Privacy Policy](${absoluteUrl("/privacy-policy", siteUrl)}): Data privacy and protection information
- [Sitemap](${absoluteUrl("/sitemap", siteUrl)}): Full site navigation
`;
}

export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const responseText = buildLlmsText(siteUrl);

  return new NextResponse(responseText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
