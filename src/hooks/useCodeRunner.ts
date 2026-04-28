// useCodeRunner.ts
// Hook de ejecución de código usando Judge0 CE vía proxy propio (/api/run).
// La key de RapidAPI vive solo en el servidor de Vercel — nunca en el browser.
//
// Flujo con wait=true: un solo POST a /api/run y recibís el resultado directo.
// No hay polling — la Vercel Function espera a Judge0 internamente.

import { useState, useCallback } from "react"

// ── Tipos ────────────────────────────────────────────────────────────────────

export type LineType = "stdout" | "stderr" | "error" | "info"

export interface OutputLine {
  id: number
  text: string
  type: LineType
}

export type RunStatus = "idle" | "running" | "success" | "error"

interface RunParams {
  langId: number
  code: string
}

// ── IDs de lenguaje en Judge0 CE ─────────────────────────────────────────────
export const JUDGE0_LANG_IDS = {
  javascript: 93,
  typescript: 74,
  python:     71,
  csharp:     51,
  java:       62,
} as const

// ── Constantes ────────────────────────────────────────────────────────────────

// CAMBIO 1: apunta a tu Vercel Function, no a Judge0 directamente
const PROXY_URL = "/api/run"

// ── Descripciones de status de Judge0 ────────────────────────────────────────

const STATUS_DESCRIPTIONS: Record<number, string> = {
  3:  "Accepted",
  4:  "Wrong Answer",
  5:  "Time Limit Exceeded",
  6:  "Compilation Error",
  7:  "Runtime Error (SIGSEGV)",
  8:  "Runtime Error (SIGXFSZ)",
  9:  "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error",
}

// ── Contador de IDs para líneas ───────────────────────────────────────────────

let lineId = 0

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCodeRunner() {
  const [lines,    setLines]    = useState<OutputLine[]>([])
  const [status,   setStatus]   = useState<RunStatus>("idle")
  const [execTime, setExecTime] = useState<number | null>(null)

  const clear = useCallback(() => {
    setLines([])
    setStatus("idle")
    setExecTime(null)
  }, [])

  const addLine = (text: string, type: LineType) => {
    setLines(prev => [...prev, { id: lineId++, text, type }])
  }

  const run = useCallback(async ({ langId, code }: RunParams) => {
    setLines([])
    setStatus("running")
    setExecTime(null)

    const t0 = performance.now()

    try {
      // CAMBIO 2: fetch simple a tu proxy, sin headers de RapidAPI ni base64.
      // La Vercel Function se encarga de todo eso.
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ langId, code }),
      })

      const ms = Math.round(performance.now() - t0)
      setExecTime(ms)

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message ?? `Error del servidor: ${response.statusText}`)
      }

      // CAMBIO 3: la respuesta ya viene decodificada desde la Vercel Function.
      // No hay que hacer atob() acá.
      const result = await response.json()

      const statusId = result.status?.id
      const stdout = result.stdout ?? ""
      const stderr = result.stderr ?? ""
      const compileOutput = result.compile_output ?? ""

      // Errores de compilación (C#, Java, TypeScript)
      if (compileOutput) {
        compileOutput.split("\n").filter(Boolean).forEach((l: string) => addLine(l, "stderr"))
      }

      // Salida estándar
      if (stdout) {
        stdout.split("\n").filter((l: string) => l !== "").forEach((l: string) => addLine(l, "stdout"))
      }

      // Errores de runtime
      if (stderr) {
        stderr.split("\n").filter(Boolean).forEach((l: string) => addLine(l, "stderr"))
      }

      // Casos especiales de Judge0
      if (statusId === 5) {
        addLine("⏱ Tiempo límite excedido (5s)", "error")
      } else if (statusId && statusId > 3 && statusId !== 6) {
        const desc = STATUS_DESCRIPTIONS[statusId] ?? `Status ${statusId}`
        addLine(`Runtime: ${desc}`, "error")
      }

      if (!stdout && !stderr && !compileOutput && statusId === 3) {
        addLine("(sin salida)", "info")
      }

      if (result.time) {
        addLine(`tiempo CPU: ${result.time}s`, "info")
      }

      setStatus(statusId === 3 ? "success" : "error")

    } catch (err) {
      const ms = Math.round(performance.now() - t0)
      setExecTime(ms)
      const message = err instanceof Error ? err.message : String(err)
      addLine(`Error: ${message}`, "error")
      setStatus("error")
    }
  }, [])

  return { lines, status, execTime, run, clear }
}