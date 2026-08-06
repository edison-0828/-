import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const requested = (await searchParams).return_to || "/";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
  redirect(returnTo);
}
