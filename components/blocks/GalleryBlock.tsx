import React, { useMemo, useState, useRef } from "react";
import { Upload, Trash2, Edit2 } from "lucide-react";
import ImageCropperModal from "@/components/ImageCropperModal";

interface GalleryBlockProps {
  content: {
    images: string[];
  };
  onUpdate?: (newContent: any) => void;
}

export default function GalleryBlock({ content, onUpdate }: GalleryBlockProps) {
  const { images } = content;
  const count = images.length;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Cropper State
  const [cropper, setCropper] = useState<{
    isOpen: boolean;
    imageSrc: string;
    targetIndex: number; // -1 for new image, >=0 for edit
  }>({
    isOpen: false,
    imageSrc: "",
    targetIndex: -1,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIndexRef = useRef<number>(-1); // To track which index triggered the upload logic

  const handleFileSelect = (index: number) => {
    activeIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCropper({
          isOpen: true,
          imageSrc: reader.result?.toString() || "",
          targetIndex: activeIndexRef.current,
        });
      });
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleCropComplete = (newUrl: string) => {
    const idx = cropper.targetIndex;
    let newImages = [...images];

    if (idx === -1) {
      // Add new (should not happen via this flow typically but just in case)
      newImages.push(newUrl);
    } else {
      // Replace existing
      newImages[idx] = newUrl;
    }

    onUpdate?.({ ...content, images: newImages });
    setCropper((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDelete = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onUpdate?.({ ...content, images: newImages });
    // If we deleted the last one and it was hovered, clear hover
    setHoverIndex(null);
  };

  const gridClass = useMemo(() => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    // 3 or 4+ images: use dynamic grid
    return "grid-cols-2 grid-rows-2";
  }, [count]);

  return (
    <div className={`grid w-full h-full gap-2 p-2 ${gridClass}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {images.map((img, index) => {
        // Layout logic for 3 images: 1st image spans 2 rows
        const isFirstOfThree = count === 3 && index === 0;

        return (
          <div
            key={index}
            className={`
                    relative rounded-lg overflow-hidden bg-gray-100 group
                    ${isFirstOfThree ? "row-span-2 h-full" : "h-full"}
                `}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <img
              src={img}
              alt={`Gallery ${index}`}
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-200 ${hoverIndex === index ? "opacity-50" : "opacity-100"}`}
            />

            {/* Overlay Buttons */}
            <div
              className={`
                    absolute inset-0 flex items-center justify-center gap-4 
                    transition-opacity duration-200
                    ${hoverIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"}
                `}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileSelect(index);
                }}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full shadow-lg hover:bg-white/20 text-white transition-all transform hover:scale-110"
                title="Replace Image"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                className="p-3 bg-red-500/10 backdrop-blur-md rounded-full shadow-lg hover:bg-red-500/30 text-red-500 hover:text-red-400 transition-all transform hover:scale-110"
                title="Delete Image"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        );
      })}

      {cropper.isOpen && (
        <ImageCropperModal
          isOpen={cropper.isOpen}
          imageSrc={cropper.imageSrc}
          onCancel={() => setCropper((prev) => ({ ...prev, isOpen: false }))}
          onCropComplete={handleCropComplete}
          // Smart aspect ratio?
          // For now let's keep it flexible or square. User said "try to match grid aspect or free".
          // Since grid is dynamic, free might be best, or 1 for square.
          // Let's use 1 for consistency or maybe undefined for free if supported.
          // React-easy-crop aspect={undefined | number}.
          // If we omit aspect props it might default to free?
          // Let's assume square for simple gallery first, or 4/3.
          aspect={4 / 3} // Generic aspect ratio
        />
      )}
    </div>
  );
}
