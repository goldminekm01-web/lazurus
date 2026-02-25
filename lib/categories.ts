import fs from "fs";
import path from "path";
import type { Category } from "./types";

const ALL_JSON = path.join(process.cwd(), "content/categories/all.json");
const CATEGORIES_DIR = path.join(process.cwd(), "content/categories");

export function getAllCategories(): Category[] {
    // Try reading from all.json first (array format)
    if (fs.existsSync(ALL_JSON)) {
        const raw = fs.readFileSync(ALL_JSON, "utf8");
        return JSON.parse(raw) as Category[];
    }
    // Fallback: individual JSON files per category
    if (!fs.existsSync(CATEGORIES_DIR)) return [];
    return fs
        .readdirSync(CATEGORIES_DIR)
        .filter((f) => f.endsWith(".json") && f !== "all.json")
        .map((file) => {
            const raw = fs.readFileSync(path.join(CATEGORIES_DIR, file), "utf8");
            return JSON.parse(raw) as Category;
        });
}

export function getCategoryBySlug(slug: string): Category | null {
    return getAllCategories().find((c) => c.slug === slug) || null;
}
