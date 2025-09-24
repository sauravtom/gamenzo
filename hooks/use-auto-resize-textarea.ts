"use client";

import { useRef, useCallback } from "react";

interface UseAutoResizeTextareaOptions {
  minHeight?: number;
  maxHeight?: number;
}

interface UseAutoResizeTextareaReturn {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  adjustHeight: (reset?: boolean) => void;
}

export function useAutoResizeTextarea(
  options: UseAutoResizeTextareaOptions = {}
): UseAutoResizeTextareaReturn {
  const { minHeight = 40, maxHeight = 200 } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback((reset?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }

    // Reset height to recalculate
    textarea.style.height = "auto";
    
    // Calculate the new height
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    
    textarea.style.height = `${newHeight}px`;
    
    // Show scrollbar if content exceeds maxHeight
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [minHeight, maxHeight]);

  return {
    textareaRef,
    adjustHeight,
  };
} 