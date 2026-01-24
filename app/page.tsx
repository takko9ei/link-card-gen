"use client";

import { useState } from "react";

// Define the LinkCardData type
interface LinkCardData {
  name: string;
  avatar: string;
  bio: string;
  blocks: Array<{
    id: string;
    type: "text" | "link";
    content: string;
  }>;
}

export default function Home() {
  // Initialize state with default data
  const [data, setData] = useState<LinkCardData>({
    name: "Your Name",
    avatar: "",
    bio: "",
    blocks: [],
  });

  // Handler for updating the name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, name: e.target.value }));
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Column: Editor */}
      <div className="w-1/2 p-10 border-r border-gray-200 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Editor</h1>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={data.name}
              onChange={handleNameChange}
              placeholder="e.g. John Doe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Placeholder for future sections */}
          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400 text-center text-sm">
            More settings coming soon...
          </div>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center p-8">
        {/* Mobile Device Container */}
        <div className="w-[375px] h-[667px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden relative">
          {/* Notch/Top Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-xl z-10"></div>

          {/* Screen Content */}
          <div className="h-full w-full overflow-y-auto bg-white pt-16 px-6 pb-8 text-center scrollbar-hide">
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse">
              {/* Avatar Image would go here */}
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-gray-900 mb-2 break-words">
              {data.name || "Your Name"}
            </h2>

            {/* Bio Placeholder */}
            <p className="text-sm text-gray-500 mb-6">
              Add a bio to tell people about yourself.
            </p>

            {/* Blocks Placeholder */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-gray-50 rounded-lg border border-gray-100"
                ></div>
              ))}
            </div>
          </div>
        </div>

        <p className="fixed bottom-8 text-gray-400 text-sm">Live Preview</p>
      </div>
    </div>
  );
}
