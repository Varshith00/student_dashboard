import { useParams } from "react-router-dom";
import EnhancedWebEditor from "@/components/EnhancedWebEditor";

export default function WebEditorPage() {
  const { language } = useParams<{ language: 'python' | 'javascript' }>();
  
  return (
    <EnhancedWebEditor 
      language={language || 'python'}
    />
  );
}
