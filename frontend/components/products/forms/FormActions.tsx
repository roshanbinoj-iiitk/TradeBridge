import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  submitText: string;
  onCancel?: () => void;
  showTerms?: boolean;
}

export function FormActions({
  isSubmitting,
  submitText,
  onCancel,
  showTerms = false,
}: FormActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full bg-jet text-isabelline hover:bg-taupe"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : submitText}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full border-jet text-jet hover:bg-jet hover:text-isabelline"
            >
              Cancel
            </Button>
          )}
        </div>

        {showTerms && (
          <p className="text-xs text-gray-600 mt-2 text-center">
            By listing your product, you agree to our terms of service.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
