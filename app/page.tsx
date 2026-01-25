"use client";

import { useState } from "react";
import Canvas from "@/components/Canvas";

// Re-defining these here for state management.
// Ideally these should be in a separate types file but for now keeping it co-located as requested.
interface Block {
  id: string;
  type: string;
  title: string;
  content: any;
  height: number;
}

interface Column {
  id: string;
  blocks: Block[];
  blockGap: number;
}

interface ProjectState {
  columns: Column[];
  columnGap: number;
  rowGap: number;
  background: string;
  gridTemplateColumns: string;
}

export default function Home() {
  const [projectState, setProjectState] = useState<ProjectState>({
    columns: [
      {
        id: "col-1",
        blockGap: 24,
        blocks: [
          {
            id: "b1",
            type: "header",
            title: "PROFILE",
            content: {
              avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
              name: "Ameato9ei",
              tags: ["百合", "SF系", "观鸟"],
              bio: "Creating digital experiences from coffee shops around the world.",
            },
            height: 160,
          },
          {
            id: "b2",
            type: "text",
            title: "ABOUT",
            content: {
              text: "I specialize in React, Next.js, and Tailwind CSS. Open for freelance work.",
            },
            height: 120,
          },
        ],
      },
      {
        id: "col-2",
        blockGap: 24,
        blocks: [
          {
            id: "b3",
            type: "gallery",
            title: "LATEST SHOTS",
            content: {
              images: [
                "https://picsum.photos/seed/1/400/400",
                "https://picsum.photos/seed/2/400/400",
                "https://picsum.photos/seed/3/400/400",
              ],
            },
            height: 300,
          },
        ],
      },
    ],

    columnGap: 24,
    rowGap: 15,
    background: "#f3f4f6",
    gridTemplateColumns: "2fr 1fr",
  });

  const updateColumns = (count: number) => {
    setProjectState((prev) => {
      let newColumns = [...prev.columns];
      let newTemplate = prev.gridTemplateColumns;

      if (count > prev.columns.length) {
        // Add columns
        for (let i = prev.columns.length; i < count; i++) {
          newColumns.push({
            id: `col-${Date.now()}-${i}`,
            blockGap: 24,
            blocks: [],
          });
        }
      } else if (count < prev.columns.length) {
        // Remove columns (and their blocks!)
        newColumns = newColumns.slice(0, count);
      }

      // Set default generic templates based on count
      if (count === 1) newTemplate = "1fr";
      if (count === 2) newTemplate = "2fr 1fr";
      if (count === 3) newTemplate = "1fr 1fr 1fr";

      return {
        ...prev,
        columns: newColumns,
        gridTemplateColumns: newTemplate,
      };
    });
  };

  const handleBlockResize = (
    columnId: string,
    blockId: string,
    newHeight: number,
  ) => {
    setProjectState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          blocks: col.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return { ...block, height: newHeight };
          }),
        };
      }),
    }));
  };

  const handleBlockUpdate = (
    columnId: string,
    blockId: string,
    newContent: any,
  ) => {
    setProjectState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          blocks: col.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return { ...block, content: newContent };
          }),
        };
      }),
    }));
  };

  const addBlock = (type: "header" | "text" | "gallery") => {
    setProjectState((prev) => {
      // Create deep copy of columns
      const newColumns = prev.columns.map((col) => ({
        ...col,
        blocks: [...col.blocks],
      }));

      // We will append to the last column by default
      if (newColumns.length === 0) return prev;

      const lastColIndex = newColumns.length - 1;
      const lastCol = newColumns[lastColIndex];
      const newBlockId = `b-${Date.now()}`;

      let newBlock: Block;

      if (type === "header") {
        newBlock = {
          id: newBlockId,
          type: "header",
          title: "NEW HEADER",
          content: {
            avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=New",
            name: "New Name",
            tags: ["New Tag"],
            bio: "New bio description.",
          },
          height: 160,
        };
      } else if (type === "gallery") {
        newBlock = {
          id: newBlockId,
          type: "gallery",
          title: "NEW GALLERY",
          content: {
            images: [
              "https://picsum.photos/seed/100/400/400",
              "https://picsum.photos/seed/101/400/400",
              "https://picsum.photos/seed/102/400/400",
            ],
          },
          height: 300,
        };
      } else {
        newBlock = {
          id: newBlockId,
          type: "text",
          title: "NEW TEXT",
          content: {
            text: "Edit this text content.",
          },
          height: 120,
        };
      }

      lastCol.blocks.push(newBlock);

      return { ...prev, columns: newColumns };
    });
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-900">
      {/* Left Column: Settings & Editor */}
      <div className="w-[400px] flex-shrink-0 border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-tight">Page Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your layout</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Columns Control */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Columns
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => updateColumns(num)}
                  className={`
                                py-3 px-4 rounded-lg font-medium text-sm transition-all border
                                ${
                                  projectState.columns.length === num
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }
                            `}
                >
                  {num} Column{num > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Gap Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Gap Spacing
              </label>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {projectState.columnGap}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="4"
              value={projectState.columnGap}
              onChange={(e) =>
                setProjectState((prev) => ({
                  ...prev,
                  columnGap: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
          </div>

          {/* Background Control */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Canvas Background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={
                  projectState.background.startsWith("#")
                    ? projectState.background
                    : "#ffffff"
                }
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }))
                }
                className="w-10 h-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
              <input
                type="text"
                placeholder="Or enter Image URL"
                value={
                  projectState.background.startsWith("http")
                    ? projectState.background
                    : ""
                }
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }))
                }
                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>

            {/* Add Content Section */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Add Content
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => addBlock("text")}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  + Add Text
                </button>
                <button
                  onClick={() => addBlock("gallery")}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  + Add Gallery
                </button>
                <button
                  onClick={() => addBlock("header")}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  + Add Header
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Tip:</strong> Drag the bottom edge of any block in the
            preview to resize it.
          </div>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex-1 bg-gray-50 p-12 overflow-y-auto flex items-center justify-center">
        <Canvas
          state={projectState}
          onBlockResize={handleBlockResize}
          onBlockUpdate={handleBlockUpdate}
        />
      </div>
    </div>
  );
}
