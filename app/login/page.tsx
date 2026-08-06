import { redirect } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const requested = (await searchParams).return_to || "/";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  await requireChatGPTUser(returnTo);
  redirect(returnTo);
}
