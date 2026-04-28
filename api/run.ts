import type { VercelRequest, VercelResponse } from "@vercel/node"

const JUDGE0_URL  = "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com"

// Decodifica un campo base64 de Judge0 a string legible
function decode(b64: string | null): string {
  if (!b64) return ""
  return Buffer.from(b64, "base64").toString("utf-8")
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { code, langId } = req.body

  if (!code || !langId) {
    return res.status(400).json({ message: "Faltan campos: code y langId son requeridos" })
  }

  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) {
    return res.status(500).json({ message: "RAPIDAPI_KEY no configurada en el servidor" })
  }

  try {
    // Llamamos a Judge0 con wait=true — espera el resultado directamente,
    // sin necesidad de polling desde el frontend
    const judgeRes = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true&fields=status,stdout,stderr,compile_output,time,memory`,
      {
        method: "POST",
        headers: {
          "Content-Type":    "application/json",
          "X-RapidAPI-Key":  apiKey,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
        body: JSON.stringify({
          // Judge0 requiere el código en base64
          source_code:     Buffer.from(code).toString("base64"),
          language_id:     langId,
          stdin:           "",
          cpu_time_limit:  5,
          wall_time_limit: 10,
        }),
      }
    )

    if (!judgeRes.ok) {
      const error = await judgeRes.json().catch(() => ({}))
      return res.status(judgeRes.status).json({
        message: error.message ?? judgeRes.statusText,
      })
    }

    const data = await judgeRes.json()

    // Decodificamos base64 acá — el frontend recibe texto plano directamente
    return res.status(200).json({
      status:         data.status,
      stdout:         decode(data.stdout),
      stderr:         decode(data.stderr),
      compile_output: decode(data.compile_output),
      time:           data.time,
      memory:         data.memory,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ message })
  }
}