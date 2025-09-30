import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface EditImageManagementProps {
  imageLinks: string[];
  newImageUrl: string;
  setNewImageUrl: (value: string) => void;
  imageLoading: boolean;
  onAddImage: () => void;
  onDeleteImage: (url: string) => void;
  onFileUpload: (files: FileList) => void;
}

export function EditImageManagement({
  imageLinks,
  newImageUrl,
  setNewImageUrl,
  imageLoading,
  onAddImage,
  onDeleteImage,
  onFileUpload,
}: EditImageManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-jet">Product Images</Label>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            onFileUpload(e.target.files);
          }
        }}
        style={{ display: "none" }}
      />

      <div className="flex gap-2">
        <Input
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="Add new image URL"
          className="border-taupe focus:border-jet"
          disabled={imageLoading}
        />
        <Button
          type="button"
          onClick={onAddImage}
          disabled={imageLoading || !newImageUrl.trim()}
        >
          Add
        </Button>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageLoading}
        >
          {imageLoading ? "Uploading..." : "Upload Files"}
        </Button>
      </div>

      {imageLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {imageLinks.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Product image ${idx + 1}`}
                className="w-20 h-14 object-cover rounded border"
                style={{ background: "#f3f3f3" }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute -top-2 -right-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                onClick={() => onDeleteImage(url)}
                disabled={imageLoading}
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
