"use client";

import { createElement } from "react";

type Props = {
  src: string;
  fileName: string;
};

export default function ModelViewer({ src, fileName }: Props) {
  return createElement("model-viewer", {
    src,
    alt: fileName,
    "camera-controls": true,
    "auto-rotate": true,
    "shadow-intensity": "1",
    style: { width: "100%", height: 420, display: "block" },
  });
}
