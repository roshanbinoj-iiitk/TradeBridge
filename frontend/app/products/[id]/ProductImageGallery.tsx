"use client";
import { useState } from "react";
import Image from "next/image";

type ProductImage = {
  image_id: number;
  image_url: string;
};

type Props = {
  images: ProductImage[];
  productName: string;
};

export default function ProductImageGallery({ images, productName }: Props) {
  // Show ALL images for this product, including duplicates
  const allImages = images.filter(
    (img) =>
      img.image_url &&
      typeof img.image_url === "string" &&
      img.image_url.trim() !== ""
  );

  const [selectedImage, setSelectedImage] = useState(
    allImages.length > 0
      ? allImages[0].image_url
      : "https://placehold.co/800x600?text=No+Image"
  );

  // Debug: log detailed information
  console.log("=== ProductImageGallery Debug ===");
  console.log("All images for this product:", allImages);
  console.log("Selected image:", selectedImage);
  console.log("Total image count:", allImages.length);
  console.log("================================");

  return (
    <>
      <Image
        src={selectedImage}
        alt={productName}
        width={800}
        height={600}
        className="w-full rounded-lg shadow-lg object-cover aspect-video"
      />
      {allImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            All Product Images ({allImages.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((img, i) => (
              <div
                key={`${img.image_id}-${i}`}
                className={`border-2 rounded-md p-1 cursor-pointer transition-all hover:scale-105 ${
                  selectedImage === img.image_url
                    ? "border-jet shadow-md"
                    : "border-platinum hover:border-gray-400"
                }`}
                onClick={() => setSelectedImage(img.image_url)}
              >
                <Image
                  src={img.image_url}
                  alt={`${productName} - Image ${i + 1}`}
                  width={300}
                  height={200}
                  className="rounded-sm object-cover w-full h-40"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
