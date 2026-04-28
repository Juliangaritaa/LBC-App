import { useRef } from "react";
import { Play, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import type { LangConfig } from "../../lib/lagnConfig";
import {
  Card,
  CardHeader,
  CardContent
} from "../ui/card"
import Editor from "@monaco-editor/react"

interface EditorPanelProps {
  config: LangConfig
  code: string
  onChange: (code: string) => void
  onRun: () => void
  running: boolean
}

export function EditorPanel({ config, code, onChange, onRun, running }: EditorPanelProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      const ta = textAreaRef.current!
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newCode = code.slice(0, start) + " " + code.slice(end)
      onChange(newCode)

      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className="flex-1 min-w-0 p-3">
      <Card className="h-full flex flex-col">

        {/* ── Header (tu toolbar) ── */}
        <CardHeader className="flex flex-row items-center gap-2 px-3 py-2 border-b">

          <span className="text-xs text-muted-foreground">
            main.{config.ext}
          </span>

          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0"
            style={{
              color: config.color,
              borderColor: `${config.color}55`,
              backgroundColor: config.colorDim,
            }}
          >
            {config.label}
          </Badge>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={running}
            className="ml-auto gap-2 text-xs h-7 px-3"
          >
            {running ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Play className="size-3" />
            )}
            {running ? "Ejecutando..." : "Ejecutar"}
          </Button>

        </CardHeader>

        {/* ── Contenido ── */}
        <CardContent className="flex-1 p-0">
          <Editor
            height="100%"
            language={config.monacoLang} 
            value={code}
            onChange={(value) => onChange(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              fontFamily: "monospace",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}