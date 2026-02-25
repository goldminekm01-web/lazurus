import fs from "fs";
import path from "path";
import type { Author } from "./types";

const AUTHORS_DIR = path.join(process.cwd(), "content/authors");

export function getAllAuthors(): Author[] {
    if (!fs.existsSync(AUTHORS_DIR)) return [];
    return fs
        .readdirSync(AUTHORS_DIR)
        .filter((f) => f.endsWith(".json"))
        .map((file) => {
            const raw = fs.readFileSync(path.join(AUTHORS_DIR, file), "utf8");
            return JSON.parse(raw) as Author;
        });
}

export function getAuthorBySlug(slug: string): Author | null {
    return getAllAuthors().find((a) => a.slug === slug) || null;
}
