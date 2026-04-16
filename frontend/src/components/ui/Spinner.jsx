import { Loader2 } from "lucide-react";

// Indicateur de chargement anime
export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return <Loader2 className={`animate-spin text-primary-500 ${sizes[size]} ${className}`} />;
}
