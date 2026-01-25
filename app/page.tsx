"use client";

import { useState, useRef } from "react";
import Canvas from "@/components/Canvas";
import { arrayMove } from "@dnd-kit/sortable";
import { Upload, Trash2 } from "lucide-react";
import ImageCropperModal from "@/components/ImageCropperModal";

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
  blockSpacing: number;
  background: string;
  gridTemplateColumns: string;
  meta?: {
    bgImage?: string;
    blockOpacity?: number;
  };
}

export default function Home() {
  const [bgCropper, setBgCropper] = useState<{
    isOpen: boolean;
    imageSrc: string;
  }>({
    isOpen: false,
    imageSrc: "",
  });
  // Need to import useRef
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const [projectState, setProjectState] = useState<ProjectState>({
    columns: [
      {
        id: "col-1",
        blockGap: 16,
        blocks: [
          {
            id: "b1",
            type: "header",
            title: "PROFILE",
            content: {
              avatar: "https://placehold.co/200?text=Avatar",
              name: "Ameato9ei",
              tags: ["百合", "SF系", "观鸟"],
              bio: "Hi, I'm Ameato9ei. Nice to meet you!",
            },
            height: 160,
          },
          {
            id: "b2",
            type: "text",
            title: "ABOUT",
            content: {
              text: "",
            },
            height: 120,
          },
        ],
      },
      {
        id: "col-2",
        blockGap: 16,
        blocks: [
          {
            id: "b3",
            type: "gallery",
            title: "LATEST SHOTS",
            content: {
              images: [
                "https://placehold.co/600x400?text=Image",
                "https://placehold.co/600x400?text=Image",
                "https://placehold.co/600x400?text=Image",
              ],
            },
            height: 300,
          },
        ],
      },
    ],

    columnGap: 16,
    blockSpacing: 16,
    background: "#f3f4f6",
    gridTemplateColumns: "2fr 1fr",
    meta: {
      blockOpacity: 1.0,
    },
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
            blockGap: 16,
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
            avatar: "https://placehold.co/200?text=Avatar",
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
              "https://placehold.co/600x400?text=Image",
              "https://placehold.co/600x400?text=Image",
              "https://placehold.co/600x400?text=Image",
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

  const handleBlockMove = (
    activeId: string,
    overId: string,
    activeColumnId: string,
    overColumnId: string,
  ) => {
    setProjectState((prev) => {
      const activeColumn = prev.columns.find(
        (col) => col.id === activeColumnId,
      );
      const overColumn = prev.columns.find((col) => col.id === overColumnId);

      if (!activeColumn || !overColumn) return prev;

      const activeBlockIndex = activeColumn.blocks.findIndex(
        (b) => b.id === activeId,
      );
      const overBlockIndex = overColumn.blocks.findIndex(
        (b) => b.id === overId,
      );

      let newColumns = [...prev.columns];

      if (activeColumnId === overColumnId) {
        // Same column reordering
        const newCol = {
          ...activeColumn,
          blocks: arrayMove(
            activeColumn.blocks,
            activeBlockIndex,
            overBlockIndex,
          ),
        };

        newColumns = newColumns.map((col) =>
          col.id === activeColumnId ? newCol : col,
        );
      } else {
        // Moving to different column
        const newActiveCol = {
          ...activeColumn,
          blocks: [...activeColumn.blocks],
        };
        const newOverCol = {
          ...overColumn,
          blocks: [...overColumn.blocks],
        };

        const [movedBlock] = newActiveCol.blocks.splice(activeBlockIndex, 1);

        // If dropping on empty column or valid target, ensure correct index
        // If overId is the column ID itself (empty column case), push to end
        let insertIndex = overBlockIndex;
        if (overId === overColumnId) {
          insertIndex = newOverCol.blocks.length;
        } else if (insertIndex === -1) {
          insertIndex = newOverCol.blocks.length;
        }

        newOverCol.blocks.splice(insertIndex, 0, movedBlock);

        newColumns = newColumns.map((col) => {
          if (col.id === activeColumnId) return newActiveCol;
          if (col.id === overColumnId) return newOverCol;
          return col;
        });
      }

      return {
        ...prev,
        columns: newColumns,
      };
    });
  };

  const handleBlockDelete = (columnId: string, blockId: string) => {
    setProjectState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          blocks: col.blocks.filter((b) => b.id !== blockId),
        };
      }),
    }));
  };

  const handleBlockTitleChange = (
    columnId: string,
    blockId: string,
    newTitle: string,
  ) => {
    setProjectState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          blocks: col.blocks.map((b) => {
            if (b.id !== blockId) return b;
            return { ...b, title: newTitle };
          }),
        };
      }),
    }));
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

          {/* Block Spacing Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Block Spacing
              </label>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {projectState.blockSpacing}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="4"
              value={projectState.blockSpacing}
              onChange={(e) =>
                setProjectState((prev) => ({
                  ...prev,
                  blockSpacing: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Block Opacity
              </label>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {Math.round((projectState.meta?.blockOpacity ?? 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={projectState.meta?.blockOpacity ?? 1}
              onChange={(e) =>
                setProjectState((prev) => ({
                  ...prev,
                  meta: {
                    ...prev.meta,
                    blockOpacity: parseFloat(e.target.value),
                  },
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
            <div className="flex flex-col gap-3">
              {/* Color Picker */}
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
                  className="w-full h-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
                />
              </div>

              {/* Background Image Upload */}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={bgFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.addEventListener("load", () => {
                        setBgCropper({
                          isOpen: true,
                          imageSrc: reader.result?.toString() || "",
                        });
                      });
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />

                {!projectState.meta?.bgImage ? (
                  <button
                    onClick={() => bgFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                  >
                    <Upload size={16} />
                    Upload Background
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={projectState.meta.bgImage}
                        alt="Background Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 gap-2">
                      <button
                        onClick={() => bgFileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded text-xs font-medium transition-colors"
                      >
                        Change
                      </button>
                      <button
                        onClick={() =>
                          setProjectState((prev) => ({
                            ...prev,
                            meta: { ...prev.meta, bgImage: undefined },
                          }))
                        }
                        className="p-1.5 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Remove Background"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Cropper */}
              {bgCropper.isOpen && (
                <ImageCropperModal
                  isOpen={bgCropper.isOpen}
                  imageSrc={bgCropper.imageSrc}
                  aspect={undefined} // Free aspect ratio for background
                  onCancel={() =>
                    setBgCropper((prev) => ({ ...prev, isOpen: false }))
                  }
                  onCropComplete={(newUrl) => {
                    setProjectState((prev) => ({
                      ...prev,
                      meta: { ...prev.meta, bgImage: newUrl },
                    }));
                    setBgCropper((prev) => ({ ...prev, isOpen: false }));
                  }}
                />
              )}
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
          onBlockMove={handleBlockMove}
          onBlockDelete={handleBlockDelete}
          onBlockTitleChange={handleBlockTitleChange}
        />
      </div>
    </div>
  );
}
