import { getChatGPTUser } from "../chatgpt-auth";
import PublishClient from "./PublishClient";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const user = await getChatGPTUser();
  return <PublishClient userName={user?.displayName || "当前账号"} authenticated={Boolean(user)} />;
}
