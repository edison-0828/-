import { requireChatGPTUser } from "../chatgpt-auth";
import PublishClient from "./PublishClient";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const user = await requireChatGPTUser("/publish");
  return <PublishClient userName={user.displayName} />;
}
