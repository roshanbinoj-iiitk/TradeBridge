"use client";
import React, { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function ListNewItem() {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Get current user ID from Supabase after mount
  React.useEffect(() => {
    const getUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        const email = data.user.email;
        if (email) {
          const resp = await fetch(
            `http://localhost:8000/get_user_by_email?email=${email}`
          );
          const userData = await resp.json();
          if (userData.id) {
            setUserId(userData.id);
          }
        }
      }
    };
    getUserId();
  }, []);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const uploadImages = async () => {
    // Upload images to Supabase storage and return public URLs
    const urls: string[] = [];
    for (const img of images) {
      const fileName = `${Date.now()}-${img.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(fileName, img);
      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        return null;
      }
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(fileName);
      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    if (!userId) {
      setError("Could not determine your user ID. Please log in again.");
      setLoading(false);
      return;
    }
    if (images.length < 1) {
      setError("Please upload at least one photo of the item.");
      setLoading(false);
      return;
    }
    // 1. Upload images to Supabase storage
    const imageUrls = await uploadImages();
    if (!imageUrls) {
      setLoading(false);
      return;
    }
    // 2. Send item data to backend
    try {
      const lender_id = userId;
      const res = await fetch("http://localhost:8000/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          description,
          price: parseFloat(price),
          images: imageUrls,
          start_date: startDate,
          end_date: endDate,
          lender_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Item listed successfully!");
        setItemName("");
        setDescription("");
        setImages([]);
        setPrice("");
        setStartDate("");
        setEndDate("");
      } else {
        if (
          typeof data.detail === "object" &&
          data.detail !== null &&
          data.detail.msg
        ) {
          setError(data.detail.msg);
        } else {
          setError(data.detail || "Failed to list item.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-400 via-blue-300 to-white px-4 py-12">
      <div className="bg-white bg-opacity-90 rounded-3xl max-w-lg w-full shadow-2xl p-10 border border-white/30">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
          List New Item
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            className="w-full border-b-2 border-gray-300 focus:border-green-500 py-2 px-3"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border-b-2 border-gray-300 focus:border-green-500 py-2 px-3"
          />
          <input
            type="number"
            placeholder="Amount (Price)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full border-b-2 border-gray-300 focus:border-green-500 py-2 px-3"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border-b-2 border-gray-300 focus:border-green-500 py-2 px-3"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full border-b-2 border-gray-300 focus:border-green-500 py-2 px-3"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Upload Item Photos (different angles, at least one required):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border-b-2 border-gray-300 focus:border-green-500 py-2 px-3"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={`Item photo ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Listing..." : "List Item"}
          </button>
        </form>
        {success && (
          <p className="text-green-600 mt-4 text-center">{success}</p>
        )}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>
    </main>
  );
}
