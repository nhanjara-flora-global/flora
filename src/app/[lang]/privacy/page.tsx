import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata("privacy", (await params).lang);
}

export default async function PrivacyPage({ params }: Props) {
  return <LegalPage doc="privacy" rawLang={(await params).lang} />;
}
