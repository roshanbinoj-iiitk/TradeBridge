import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useImageManagement(userId?: string) {
  const [imageInput, setImageInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const addImageUrl = (
    imageInput: string,
    currentImages: string[],
    onUpdate: (urls: string[]) => void
  ) => {
    if (imageInput.trim() && !currentImages.includes(imageInput.trim())) {
      onUpdate([...currentImages, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImageUrl = (
    index: number,
    currentImages: string[],
    onUpdate: (urls: string[]) => void
  ) => {
    onUpdate(currentImages.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    files: FileList,
    currentImages: string[],
    onUpdate: (urls: string[]) => void
  ) => {
    if (!userId) return;

    setIsUploading(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      onUpdate([...currentImages, ...uploadedUrls]);

      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    imageInput,
    setImageInput,
    isUploading,
    addImageUrl,
    removeImageUrl,
    handleFileUpload,
  };
}
