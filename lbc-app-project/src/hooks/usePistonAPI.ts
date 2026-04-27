// usePistonAPI.ts
// Custom hook: toda la lógica de comunicación con Piston API vive acá.
// Los componentes nunca hacen fetch directamente — llaman a este hook.
//
// ¿Por qué un hook y no una función normal?
// Porque necesitamos que React sepa cuándo cambió el estado (lines, status, execTime)
// para re-renderizar la UI. useState y useCallback son de React, no pueden
// vivir fuera de un componente o de un hook.

import { useState, useCallback } from "react"

// URL base de la API pública de Piston
const PISTON_URL = "https://emkc.org/api/v2/piston/execute"

// Tipos para las líneas de output
export type LineType = "stdout" | "stderr" | "error" | "info"

export interface OutputLine {
  id: number       // necesario para que React identifique cada línea en la lista
  text: string
  type: LineType
}

// Estado del proceso de ejecución
export type RunStatus = "idle" | "running" | "success" | "error"

// Parámetros que necesita la función run()
interface RunParams {
  lang: string     // ej: "python"
  version: string  // ej: "3.10.0"
  ext: string      // ej: "py"
  code: string     // el código que escribió el usuario
}

// Contador global para generar IDs únicos por línea
let lineId = 0

export function usePistonAPI() {
  const [lines, setLines] = useState<OutputLine[]>([])
  const [status, setStatus] = useState<RunStatus>("idle")
  const [execTime, setExecTime] = useState<number | null>(null)

  // clear: resetea la consola al estado inicial
  const clear = useCallback(() => {
    setLines([])
    setStatus("idle")
    setExecTime(null)
  }, [])

  // addLine: agrega una línea al output sin borrar las anteriores
  // Usamos función updater (prev => ...) para no depender del valor actual en closures
  const addLine = (text: string, type: LineType) => {
    setLines(prev => [...prev, { id: lineId++, text, type }])
  }

  // run: ejecuta el código en Piston API y actualiza el estado
  const run = useCallback(async ({ lang, version, ext, code }: RunParams) => {
    // 1. Limpiar output anterior y marcar como "ejecutando"
    setLines([])
    setStatus("running")
    setExecTime(null)

    const startTime = performance.now()

    try {
      // 2. Armar el body del request según la spec de Piston API v2
      const requestBody = {
        language: lang,
        version: version,
        files: [
          {
            name: `main.${ext}`,  // Piston necesita un nombre de archivo
            content: code,
          },
        ],
        stdin: "",             // input del usuario (vacío por ahora)
        args: [],              // argumentos de línea de comandos
        compile_timeout: 10000, // ms máximos para compilar (Java, C#, TS)
        run_timeout: 5000,     // ms máximos para ejecutar
      }

      // 3. Hacer el fetch
      const response = await fetch(PISTON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      // Registrar tiempo antes de parsear la respuesta
      const ms = Math.round(performance.now() - startTime)
      setExecTime(ms)

      // Si la API respondió con un error HTTP (ej: 429 rate limit, 500 server error)
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
      }

      // 4. Parsear la respuesta JSON de Piston
      // La respuesta tiene esta forma:
      // {
      //   compile: { stdout, stderr, output, code } — para lenguajes compilados
      //   run:     { stdout, stderr, output, code } — siempre presente
      // }
      const data = await response.json()

      // 5. Mostrar errores de compilación (Java, C#, TypeScript los tienen)
      if (data.compile?.stderr) {
        data.compile.stderr
          .split("\n")
          .filter(Boolean)
          .forEach((line: string) => addLine(line, "stderr"))
      }

      // 6. Mostrar stdout (lo que imprimió el programa)
      const stdout: string = data.run?.stdout ?? ""
      const stderr: string = data.run?.stderr ?? ""

      if (stdout) {
        stdout
          .split("\n")
          .filter((line: string) => line !== "")
          .forEach((line: string) => addLine(line, "stdout"))
      }

      // 7. Mostrar stderr de ejecución (excepciones, errores en runtime)
      if (stderr) {
        stderr
          .split("\n")
          .filter(Boolean)
          .forEach((line: string) => addLine(line, "stderr"))
      }

      // 8. Si no hubo ninguna salida, informar al usuario
      if (!stdout && !stderr) {
        addLine("(sin salida)", "info")
      }

      // 9. Determinar si la ejecución fue exitosa
      // data.run.code es el exit code del proceso (0 = OK, cualquier otro = error)
      const exitCode = data.run?.code ?? 0
      const hasError = !!stderr || exitCode !== 0
      setStatus(hasError ? "error" : "success")

    } catch (err) {
      // Error de red, timeout, o respuesta no-JSON
      const ms = Math.round(performance.now() - startTime)
      setExecTime(ms)

      const message = err instanceof Error ? err.message : String(err)
      addLine(`Error: ${message}`, "error")
      addLine("Verificá tu conexión o que emkc.org esté disponible.", "info")
      setStatus("error")
    }
  }, []) // sin dependencias: run nunca cambia entre renders

  return { lines, status, execTime, run, clear }
}