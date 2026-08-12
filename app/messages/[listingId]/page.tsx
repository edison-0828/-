import { redirect } from "next/navigation";
import { getChatGPTUser } from "../../chatgpt-auth";
import MessageThreadClient from "./MessageThreadClient";

export const dynamic = "force-dynamic";

export default async function MessagePage({ params, searchParams }: { params: Promise<{ listingId: string }>; searchParams: Promise<{ with?: string }> }) {
  const { listingId } = await params;
  const participantId = (await searchParams).with || "";
  const user = await getChatGPTUser();
  const returnTo = `/messages/${encodeURIComponent(listingId)}${participantId ? `?with=${encodeURIComponent(participantId)}` : ""}`;
  if (!user) redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);

  return <MessageThreadClient listingId={listingId} participantId={participantId} />;
}
