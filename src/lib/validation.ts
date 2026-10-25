import { z } from "zod";

export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export const ideaInputSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  description: z.string().max(5000).default(""),
  explanation: z.string().max(50000).default(""),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format harus YYYY-MM"),
  lockStatus: z.enum(["open", "title_only", "hidden"]).default("hidden"),
});

export const ideaUpdateSchema = ideaInputSchema.partial();

export const ideaFilesInputSchema = z.array(
  z.object({
    kind: z.enum(["image", "video", "html", "model3d", "cad", "other"]),
    fileName: z.string().min(1).max(300),
    mimeType: z.string().min(0).max(120),
    sizeBytes: z.number().int().min(1).max(MAX_FILE_BYTES),
    url: z.string().url(),
    pathname: z.string().min(1).max(500),
  }),
);

export const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
