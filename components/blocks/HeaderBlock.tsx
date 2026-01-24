"use client";

import React, { useState, useRef } from "react";
import InlineText from "@/components/InlineText";
import AvatarCropper from "@/components/AvatarCropper";

interface HeaderBlockProps {
  content: {
    avatar: string;
    name: string;
    tags: string[];
    bio: string;
  };
  onUpdate?: (newContent: any) => void;
}

export default function HeaderBlock({ content, onUpdate }: HeaderBlockProps) {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (field: string, value: any) => {
    onUpdate?.({ ...content, [field]: value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImage(reader.result?.toString() || null);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-row items-center gap-4 h-full p-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar */}
      <div
        className="relative group cursor-pointer"
        onClick={handleAvatarClick}
      >
        <img
          src={content.avatar}
          alt={content.name}
          className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-100 shadow-sm group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0 text-left w-full">
        <InlineText
          value={content.name}
          onChange={(val) => handleUpdate("name", val)}
          tagName="h1"
          className="text-xl font-bold text-gray-900 truncate"
        />

        {/* Tags (Static for now, can make interactive later if needed) */}
        <div className="flex flex-wrap gap-2 my-1">
          {content.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <InlineText
          value={content.bio}
          onChange={(val) => handleUpdate("bio", val)}
          tagName="p"
          className="text-sm text-gray-500 line-clamp-2"
          multiline
        />
      </div>

      {/* Cropper Modal */}
      {isCropperOpen && selectedImage && (
        <AvatarCropper
          imageSrc={selectedImage}
          onCancel={() => setIsCropperOpen(false)}
          onCropComplete={(newAvatarUrl) => {
            handleUpdate("avatar", newAvatarUrl);
            setIsCropperOpen(false);
          }}
        />
      )}
    </div>
  );
}
