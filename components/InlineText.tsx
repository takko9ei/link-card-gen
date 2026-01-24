"use client";

import React, { useState, useEffect, useRef } from "react";

interface InlineTextProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  tagName?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  multiline?: boolean;
}

export default function InlineText({
  value,
  onChange,
  className = "",
  tagName = "p",
  multiline = false,
}: InlineTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const commitChange = () => {
    setIsEditing(false);
    if (tempValue !== value) {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Shift+Enter for newline in textarea
      e.preventDefault();
      commitChange();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setTempValue(value); // Revert
    }
  };

  if (isEditing) {
    const commonClasses = `bg-white border-2 border-blue-500 rounded outline-none px-1 w-full text-black min-w-[20px] ${className}`;

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={commitChange}
          onKeyDown={handleKeyDown}
          className={commonClasses}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={commitChange}
        onKeyDown={handleKeyDown}
        className={commonClasses}
      />
    );
  }

  // Render the tag dynamically
  const Tag = tagName as any;

  return (
    <Tag
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-text hover:bg-gray-100/50 hover:ring-2 hover:ring-gray-200/50 rounded px-1 -mx-1 transition-all`}
      title="Click to edit"
    >
      {value}
    </Tag>
  );
}
