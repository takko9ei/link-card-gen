import React, { useMemo } from "react";

interface GalleryBlockProps {
  content: {
    images: string[];
  };
}

export default function GalleryBlock({ content }: GalleryBlockProps) {
  const { images } = content;
  const count = images.length;

  const gridClass = useMemo(() => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    // 3 or 4+ images: use dynamic grid
    return "grid-cols-2 grid-rows-2";
  }, [count]);

  return (
    <div className={`grid w-full h-full gap-2 p-2 ${gridClass}`}>
      {images.map((img, index) => {
        // Layout logic for 3 images: 1st image spans 2 rows
        const isFirstOfThree = count === 3 && index === 0;

        return (
          <div
            key={index}
            className={`
                    relative rounded-lg overflow-hidden bg-gray-100
                    ${isFirstOfThree ? "row-span-2 h-full" : "h-full"}
                `}
          >
            <img
              src={img}
              alt={`Gallery ${index}`}
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>
        );
      })}
    </div>
  );
}
