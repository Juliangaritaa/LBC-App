import { useState, useCallback } from "react";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

let lineIdCounter = 0;
function makeLine(text, type) {
    return {
        id: lineIdCounter++,
        text,
        type
    };
}

export function usePistoAPI() {
    const [lines, setLines] = useState([]);
    const [status, setStatus] = useState("idle");
    const [execTIme, setExecTime] = useState(null);

    const clear = useCallback(() => {
        setLines([]);
        setStatus("idle");
        setExecTime(null);
    }, []);

    const run = useCallback(async ({ lang, version, ext, code}) => {
        setLines([]);
        setStatus("running");
        setExecTime(null);

        const t0 = performance.now();

        const addLine = (text, type) =>
            setLines((prev) => [...prev, makeLine(text, type)]);

        try {
            const res = await fetch(PISTON_URL, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    languaje: lang,
                    version: version,
                    files: [{ name: `main.${ext}`, content: code }],
                    stidn: "",
                    args: [],
                    compile_timeout: 10000,
                    run_timeout: 5000,
                }),
            });

            const ms = Math.round(performance.now()) - t0;
            setExecTime(ms)

            if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

            const data = await res.json();

            if (data.compile?.stderr) {
                data.compile.stderr
                .split("\n").filter(Boolean)
                .forEach((l) => addLine(l, "stderr"));
            }

            const stdout = data.run?.stdout || "";
            const stderr = data.run?.stderr || "";

            if (stdout) {
                stdout.split("\n")
                    .filter((l) => l !== "")
                    .forEach((l) => addLine(l, "stdout"));
            }

            if (stderr) {
                stderr.split("\n").filter(Boolean)
                    .forEach((l) => addLine(l, "stderr"));
            }

            if (!stdout && !stderr) {
                addLine("(sin salida)", "info");
            }

            const hasError = stderr || (data.run?.code !== undefined && data.run.code !==0);
            setStatus(hasError ? "error":"success");

        } catch (err) {
            const ms = Math.round(performance.now() - t0);
            setExecTime(ms);
            addLine("Error de red: " + err.message, "error");
            addLine("Verifica tu conexión o que emkc.org esté disponible", "info");
            setStatus("error");
        }
    }, []);

    return {
        lines,
        status,
        execTIme,
        run,
        clear
    }
}