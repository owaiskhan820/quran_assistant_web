"use client";

import { useLayoutEffect } from "react";

export default function QpcFontStyleRegistry({
  cssText,
  preloadPages = [],
}: {
  cssText: string;
  preloadPages?: number[];
}) {
  useLayoutEffect(() => {
    const head = document.head;

    let styleTag = document.getElementById(
      "qpc-page-fonts",
    ) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "qpc-page-fonts";
      head.appendChild(styleTag);
    }
    styleTag.textContent = cssText;

    const preloadSet = new Set(preloadPages);
    const existingPreloads = Array.from(
      head.querySelectorAll('link[data-qpc-preload="true"]'),
    );

    for (const link of existingPreloads) {
      const page = Number.parseInt(link.getAttribute("data-page") ?? "", 10);
      if (!preloadSet.has(page)) {
        link.remove();
      }
    }

    for (const page of preloadSet) {
      const preloadId = `qpc-preload-p${page}`;
      if (head.querySelector(`#${preloadId}`)) {
        continue;
      }

      const link = document.createElement("link");
      link.id = preloadId;
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = `/fonts/qpc/p${page}.woff2`;
      link.setAttribute("data-qpc-preload", "true");
      link.setAttribute("data-page", String(page));
      head.appendChild(link);
    }
  }, [cssText, preloadPages]);

  return null;
}
