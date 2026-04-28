import { useEffect, useRef } from "react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { OutputLine, RunStatus } from "../../hooks/useCodeRunner";
import type { LangConfig } from "../../lib/lagnConfig";
import {
  Card,
  CardHeader,
  CardContent
} from "../ui/card"

interface OutputPanelProps {
  lines: OutputLine[]
  status: RunStatus
  execTime: number | null
  onClear: () => void
  config: LangConfig
}

const STATUS_LABEL: Record<RunStatus, string> = {
  idle: "Listo",
  running: "Ejecutando...",
  success: "Completado",
  error: "Error"
}

const STATUS_DOT_CLASS: Record<RunStatus, string> = {
  idle: "bg-border",
  running: "bg-yellow-500 animate-pulse",
  success: "bg-green-500",
  error: "bg-red-500",
}

const LINE_CLASS: Record<OutputLine["type"], string> = {
  stdout: "text-foreground",
  stderr: "text-orange-400",
  error: "text-red-400",
  info: "text-muted-foreground italic",
}

export function OutputPanel({ lines, status, execTime, onClear }: OutputPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  const isEmpty = lines.length === 0

  return (
    <div className="w-[42%] min-w-[260px] p-3">
      <Card className="h-full flex flex-col">

        {/* ── Header ── */}
        <CardHeader className="flex flex-row items-center gap-2 px-3 py-2 border-b">

          <span className={cn(
            "size-2 rounded-full",
            STATUS_DOT_CLASS[status]
          )} />

          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Consola
            </span>

            <span className="text-xs text-muted-foreground">
              {STATUS_LABEL[status]}
            </span>
          </div>

          {execTime !== null && (
            <span className="text-[10px] text-muted-foreground/50">
              {execTime}ms
            </span>
          )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="ml-auto h-6 px-2 text-[10px]"
            >
              limpiar
            </Button>

        </CardHeader>

        {/* ── Contenido ── */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 text-[12.5px] leading-relaxed">

              {isEmpty ? (
                <div className="flex justify-center pt-12 text-muted-foreground/40">
                  <span className="text-xs italic">
                    Presioná Ejecutar o Ctrl+Enter
                  </span>
                </div>
              ) : (
                <>
                  {lines.map(line => (
                    <span
                      key={line.id}
                      className={cn(
                        "block whitespace-pre-wrap break-all",
                        LINE_CLASS[line.type]
                      )}
                    >
                      {line.text}
                    </span>
                  ))}
                  <div ref={bottomRef} />
                </>
              )}

            </div>
          </ScrollArea>
        </CardContent>

      </Card>
    </div>
  )
}
