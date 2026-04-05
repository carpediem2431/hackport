"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type TextTypeElement = "div" | "h1" | "h2" | "p" | "span";

type TextTypeProps = {
  as?: TextTypeElement;
  text: string | string[];
  loop?: boolean;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  initialDelay?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorBlinkDuration?: number;
  hideCursorWhileTyping?: boolean;
  className?: string;
};

export function TextType({
  as: Component = "div",
  text,
  loop = true,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  initialDelay = 0,
  showCursor = true,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.5,
  hideCursorWhileTyping = false,
  className,
}: TextTypeProps) {
  const sentences = useMemo(() => {
    if (Array.isArray(text)) {
      return text.filter((sentence) => sentence.length > 0);
    }

    return text.length > 0 ? [text] : [];
  }, [text]);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeSentence = sentences[sentenceIndex] ?? "";
  const characters = useMemo(() => Array.from(activeSentence), [activeSentence]);
  const displayedText = useMemo(
    () => characters.slice(0, displayedLength).join(""),
    [characters, displayedLength],
  );
  const isTyping = displayedLength < characters.length;
  const shouldShowCursor = showCursor && !(hideCursorWhileTyping && isTyping);

  useEffect(() => {
    if (characters.length === 0) {
      return;
    }

    if (!loop && displayedLength >= characters.length) {
      return;
    }

    const delay = (() => {
      if (!loop) {
        return displayedLength === 0 ? initialDelay : typingSpeed;
      }

      if (!isDeleting && displayedLength < characters.length) {
        return displayedLength === 0 ? initialDelay : typingSpeed;
      }

      if (!isDeleting && displayedLength === characters.length) {
        return pauseDuration;
      }

      return deletingSpeed;
    })();

    const timer = window.setTimeout(() => {
      if (!loop) {
        setDisplayedLength((currentLength) => Math.min(currentLength + 1, characters.length));
        return;
      }

      if (!isDeleting && displayedLength < characters.length) {
        setDisplayedLength((currentLength) => Math.min(currentLength + 1, characters.length));
        return;
      }

      if (!isDeleting && displayedLength === characters.length) {
        setIsDeleting(true);
        return;
      }

      if (displayedLength > 0) {
        setDisplayedLength((currentLength) => Math.max(currentLength - 1, 0));
        return;
      }

      setIsDeleting(false);
      setSentenceIndex((currentIndex) => (currentIndex + 1) % sentences.length);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    characters,
    deletingSpeed,
    displayedLength,
    initialDelay,
    isDeleting,
    loop,
    pauseDuration,
    sentences.length,
    typingSpeed,
  ]);

  const accessibleLabel = sentences.join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Component aria-label={accessibleLabel} className={className}>
        <span className="sr-only">{accessibleLabel}</span>
        <span aria-hidden="true" className="whitespace-pre-line">
          {displayedText}
          {shouldShowCursor ? (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: cursorBlinkDuration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              {cursorCharacter}
            </motion.span>
          ) : null}
        </span>
      </Component>
    </motion.div>
  );
}
