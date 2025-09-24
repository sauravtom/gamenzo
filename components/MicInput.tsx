"use client";

import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface MicInputProps {
  onTranscription: (text: string) => void;
}

export default function MicInput({ onTranscription }: MicInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");

          try {
            const response = await fetch("/api/speech-to-text", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              onTranscription(data.text);
            } else {
              console.error("Speech-to-text API error:", await response.text());
            }
          } catch (error) {
            console.error("Error transcribing audio:", error);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleMicClick}
      className="p-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors rounded-lg border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]"
    >
      {isRecording ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
    </button>
  );
} 