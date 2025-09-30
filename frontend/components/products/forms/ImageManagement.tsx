import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { ProductFormData } from "@/types/products/forms";

interface ImageManagementProps {
  formData: ProductFormData;
  onUpdate: (field: keyof ProductFormData, value: any) => void;
  imageInput: string;
  setImageInput: (value: string) => void;
  isUploading: boolean;
  onFileUpload: (files: FileList) => void;
  onAddUrl: () => void;
  onRemoveImage: (index: number) => void;
}

export function ImageManagement({
  formData,
  onUpdate,
  imageInput,
  setImageInput,
  isUploading,
  onFileUpload,
  onAddUrl,
  onRemoveImage,
}: ImageManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2" />
          Product Images
        </CardTitle>
        <CardDescription>
          Add image URLs to showcase your product (optional but recommended)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && onFileUpload(e.target.files)}
          style={{ display: "none" }}
        />

        <div className="flex gap-2">
          <Input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Enter image URL"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddUrl();
              }
            }}
          />
          <Button type="button" onClick={onAddUrl} variant="outline">
            Add URL
          </Button>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </Button>
        </div>

        {formData.image_urls.length > 0 && (
          <div className="space-y-2">
            <Label>Added Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.image_urls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
