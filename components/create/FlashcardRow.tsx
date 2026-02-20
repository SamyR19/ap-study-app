'use client';

import { GripVertical, Trash2, Image } from 'lucide-react';

interface FlashcardRowProps {
  index: number;
  front: string;
  back: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  onDelete: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function FlashcardRow({
  index,
  front,
  back,
  onFrontChange,
  onBackChange,
  onDelete,
  isDragging,
  dragHandleProps,
}: FlashcardRowProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-cream-200 overflow-hidden transition-shadow ${
        isDragging ? 'shadow-lg' : 'hover:shadow-md'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-cream-50 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-cream-200 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-charcoal-light" />
          </div>
          <span className="text-sm font-medium text-charcoal">{index}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 rounded-lg hover:bg-cream-200 transition-colors text-charcoal-light hover:text-charcoal"
            title="Add image"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-100 transition-colors text-charcoal-light hover:text-red-500"
            title="Delete card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="grid grid-cols-2 divide-x divide-cream-200">
        {/* Term/Front */}
        <div className="p-4">
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wide mb-2">
            Term
          </label>
          <textarea
            value={front}
            onChange={(e) => onFrontChange(e.target.value)}
            placeholder="Enter term"
            className="w-full min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-charcoal placeholder:text-charcoal-light/50 bg-transparent"
          />
        </div>

        {/* Definition/Back */}
        <div className="p-4">
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wide mb-2">
            Definition
          </label>
          <textarea
            value={back}
            onChange={(e) => onBackChange(e.target.value)}
            placeholder="Enter definition"
            className="w-full min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-charcoal placeholder:text-charcoal-light/50 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
