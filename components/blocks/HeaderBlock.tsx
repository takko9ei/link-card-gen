import React from "react";

interface HeaderBlockProps {
  content: {
    avatar: string;
    name: string;
    tags: string[];
    bio: string;
  };
}

export default function HeaderBlock({ content }: HeaderBlockProps) {
  return (
    <div className="flex flex-row items-center gap-4 h-full p-4">
      {/* Avatar */}
      <img
        src={content.avatar}
        alt={content.name}
        className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-100 shadow-sm"
      />

      {/* Info */}
      <div className="flex flex-col gap-2 min-w-0 text-left">
        <h1 className="text-xl font-bold text-gray-900 truncate">
          {content.name}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {content.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2">{content.bio}</p>
      </div>
    </div>
  );
}
