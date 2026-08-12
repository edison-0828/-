import { getChatGPTUser } from "../chatgpt-auth";
import PublishClient from "./PublishClient";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const user = await getChatGPTUser();
  return <PublishClient authenticated={Boolean(user)} />;
}
