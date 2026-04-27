import { useRef } from "react";
import { Play, Loader2, Badge } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "radix-ui";
import { cn } from "../../lib/utils";
import type { LangConfig } from "../../lib/lagnConfig";

interface EditorPanelProps {
    config: LangConfig
    code: string
    onChange: (code: string) => void
    onRun: () => void
    running: boolean
}

export function EditorPanel({ config, code, onChange, onRun, running}: EditorPanelProps) {
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
    <div className="flex-1 flex flex-col min-w-0 border-r border-border">
      {/* ── Toolbar del editor ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border shrink-0">
        {/* Nombre del archivo con extensión del lenguaje activo */}
        <span className="text-xs text-muted-foreground font-mono">
          main.{config.ext}
        </span>
 
        {/* Badge de versión — usa shadcn Badge con estilos personalizados via style */}
        <Badge
          variant="outline"
          className="text-[10px] font-mono px-2 py-0"
          style={{
            color: config.color,
            borderColor: `${config.color}55`,
            backgroundColor: config.colorDim,
          }}
        >
          {config.label} {config.pistonVersion}
        </Badge>
 
        <Separator orientation="vertical" className="h-4 mx-1" />
 
        {/* Botón de ejecución — shadcn Button con variante outline */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRun}
          disabled={running}
          className={cn(
            "ml-auto gap-2 text-xs font-mono h-7 px-3",
            "transition-all duration-150",
            // Cuando no está ejecutando, aplicamos color del lenguaje como acento
            !running && "hover:opacity-80"
          )}
          style={
            !running
              ? {
                  color: config.color,
                  borderColor: `${config.color}55`,
                  backgroundColor: config.colorDim,
                }
              : undefined
          }
        >

          {running ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Play className="size-3" />
          )}
          {running ? "Ejecutando..." : "Ejecutar"}
        </Button>
      </div>
 
      {/* ── Área de código ── */}
 
      <textarea
        ref={textAreaRef}
        value={code}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={cn(
          "flex-1 w-full resize-none",
          "bg-background text-foreground",
          "font-mono text-[13px] leading-relaxed",
          "p-4 outline-none border-none",
          "caret-primary"
        )}
        style={{ tabSize: 2, minHeight: "400px" }}
      />
    </div>
  )
}