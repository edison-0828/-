import SiteHeader from "../_components/SiteHeader";
import { getChatGPTUser } from "../chatgpt-auth";
import MarketTrendsClient from "./MarketTrendsClient";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const user = await getChatGPTUser();

  return <main className="zuji-page zuji-black-yellow-theme">
    <SiteHeader active="market" userName={user?.displayName || null} authMethod={user?.authMethod || null} />
    <MarketTrendsClient />
  </main>;
}
