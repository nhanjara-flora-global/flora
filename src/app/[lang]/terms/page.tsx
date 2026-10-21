import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal-page";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return legalMetadata("terms", (await params).lang);
}

export default async function TermsPage({ params }: Props) {
  return <LegalPage doc="terms" rawLang={(await params).lang} />;
}
