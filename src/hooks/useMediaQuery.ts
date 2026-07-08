import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches.
 *
 * Safe to use in environments where `window` is undefined during the
 * initial render; it will re-evaluate once mounted on the client.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);

    const update = () => {
      setMatches(media.matches);
    };

    update();

    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, [query]);

  return matches;
}
