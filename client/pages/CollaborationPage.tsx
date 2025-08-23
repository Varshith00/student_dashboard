import { useParams } from "react-router-dom";
import CollaborativeEditor from "@/components/CollaborativeEditor";

export default function CollaborationPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();

  return <CollaborativeEditor sessionId={sessionId} language="python" />;
}
