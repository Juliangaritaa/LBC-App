export type LangKey = "javascript" | "typescript" | "python" | "csharp" | "java";

export interface LangConfig {
    label: string
    ext: string
    langId: number
    runtimeLabel: string
    color: string
    colorDim: string
    monacoLang: string
}

export const LANG_CONFIG: Record<LangKey, LangConfig> = {
    javascript: {
        label: "JavaScript",
        ext: "js",
        langId: 93,
        runtimeLabel: "Node.js 18.15.0",
        color: "#F7DF1E",
        colorDim: "rgba(247,223,30,0.08)",
        monacoLang: "javascript"
    },
    typescript: {
        label: "TypeScript",
        ext: "ts",
        langId: 74,
        runtimeLabel: "TypeScript 4.2.3",
        color: "#3178C6",
        colorDim: "rgba(49,120,198,0.08)",
        monacoLang: "typescript"
    },
    python: {
        label: "Python",
        ext: "py",
        langId: 71,
        runtimeLabel: "Python 3.8.1",
        color: "#3776AB",
        colorDim: "rgba(55,118,171,0.08)",
        monacoLang: "python"
    },
    csharp: {
        label: "C#",
        ext: "cs",
        langId: 51,
        runtimeLabel: "C# Mono 6.6.0",
        color: "#9B4F96",
        colorDim: "rgba(155,79,150,0.08)",
        monacoLang: "csharp"
    },
        java: {
        label: "Java",
        ext: "java",
        langId: 62,
        runtimeLabel: "Java OpenJDK 13.0.1",
        color: "#ED8B00",
        colorDim: "rgba(237,139,0,0.08)",
        monacoLang: "java"
    }
}

export const LANG_KEYS = Object.keys(LANG_CONFIG) as LangKey[];