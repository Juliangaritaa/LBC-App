export type LangKey = "javascript" | "typescript" | "python" | "csharp" | "java";

export interface LangConfig {
    label: string
    ext: string
    pistonLang: string
    pistonVersion: string
    color: string
    colorDim: string
}

export const LANG_CONFIG: Record<LangKey, LangConfig> = {
    javascript: {
        label: "JavaScript",
        ext: "js",
        pistonLang: "javascript",
        pistonVersion: "18,15,0",
        color: "#F7DF1E",
        colorDim: "rgba(247,223,30,0.08)"
    },
    typescript: {
        label: "TypeScript",
        ext: "ts",
        pistonLang: "typescript",
        pistonVersion: "5.0.3",
        color: "#3178C6",
        colorDim: "rgba(49,120,198,0.08)"
    },
    python: {
        label: "Python",
        ext: "py",
        pistonLang: "python",
        pistonVersion: "3.10.0",
        color: "#3776AB",
        colorDim: "rgba(55,118,171,0.08)"
    },
    csharp: {
    label: "C#",
    ext: "cs",
    pistonLang: "csharp",
    pistonVersion: "6.12.0",
    color: "#9B4F96",
    colorDim: "rgba(155,79,150,0.08)"
    },
    java: {
    label: "Java",
    ext: "java",
    pistonLang: "java",
    pistonVersion: "15.0.2",
    color: "#ED8B00",
    colorDim: "rgba(237,139,0,0.08)"
    }
}

export const LANG_KEYS = Object.keys(LANG_CONFIG) as LangKey[];