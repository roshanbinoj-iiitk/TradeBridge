import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProductPageHeaderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function ProductPageHeader({
  title,
  description,
  onBack,
}: ProductPageHeaderProps) {
  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h1 className="text-4xl font-bold font-serif text-jet mb-2">{title}</h1>
      <p className="text-taupe">{description}</p>
    </div>
  );
}
