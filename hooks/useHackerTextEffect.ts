import { useCallback, useEffect, useRef, useState } from "react";

export default function useHackerTextEffect(targetText: string) {
  const displayText = targetText;
  return { displayText };
}
