import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data } = await supabase
      .from("shared_results")
      .select("title, type, metadata")
      .eq("id", id)
      .single();

    const title = data?.title || "Signux AI Analysis";
    const verdict = data?.metadata?.verdict || "";
    const score = data?.metadata?.viability_score || "";
    const type = data?.type || "simulate";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://signux-ai.vercel.app";
    const ogUrl = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&verdict=${encodeURIComponent(verdict)}&score=${encodeURIComponent(score)}&type=${encodeURIComponent(type)}`;

    return {
      title: `${title} — Signux AI`,
      description: `AI analysis: ${verdict ? verdict + " verdict" : "See the full report"} — Powered by Signux AI`,
      openGraph: {
        title: `${title} — Signux AI`,
        description: `${verdict ? verdict + " verdict. Score: " + score + "/10. " : ""}See the full analysis.`,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — Signux AI`,
        images: [ogUrl],
      },
    };
  } catch {
    return {
      title: "Signux AI Analysis",
      description: "AI-powered decision intelligence — Signux AI",
    };
  }
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
