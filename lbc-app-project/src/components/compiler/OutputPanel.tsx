import { useEffect, useRef } from "react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { OutputLine, RunStatus } from "../../hooks/useCodeRunner";
import type { LangConfig } from "../../lib/lagnConfig";

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
    idle:    "bg-border",
    running: "bg-yellow-500 animate-pulse",
    success: "bg-green-500",
    error:   "bg-red-500",    
}

const LINE_CLASS: Record<OutputLine["type"], string> = {
    stdout: "text-foreground",
    stderr: "text-orange-400",
    error:  "text-red-400",
    info:   "text-muted-foreground italic",
}

export function OutputPanel({ lines, status, execTime, onClear }: OutputPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth"})
    }, [lines])

    const isEmpty = lines.length === 0

return (
    <div className="w-[42%] min-w-[260px] flex flex-col border-l border-border bg-muted/10">
 
      {/* ── Header de la consola ── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border shrink-0">
        {/* Punto de estado animado */}
        <span className={cn("size-2 rounded-full shrink-0 transition-colors duration-300", STATUS_DOT_CLASS[status])} />
 
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase font-sans antialiased">
          Consola
        </span>
 
        <span className="text-xs text-muted-foreground">
          {STATUS_LABEL[status]}
        </span>
 
        {/* Tiempo de ejecución — solo se muestra cuando hay un valor */}
        {execTime !== null && (
          <span className="text-[10px] text-muted-foreground/50 font-sans antialiased">
            {execTime}ms
          </span>
        )}
 
        {/* Botón de limpiar — solo visible cuando hay output */}
        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="ml-auto h-6 px-2 text-[10px] text-muted-foreground/60 hover:text-muted-foreground font-sans antialiased"
          >
            limpiar
          </Button>
        )}
      </div>
 
      {/* ── Cuerpo: líneas de output ── */}
      {/*
        ScrollArea de shadcn: un contenedor con scroll personalizado.
        Necesita altura fija para funcionar, por eso usamos flex-1 en el padre
        y h-full acá dentro.
      */}
      <ScrollArea className="flex-1">
        <div className="p-4 font-sans antialiased text-[12.5px] leading-relaxed">
          {isEmpty ? (
            // Estado vacío: mensaje placeholder
            <div className="flex flex-col items-center justify-center pt-12 gap-2 text-muted-foreground/40">
              <span className="text-xs italic">Presioná Ejecutar o Ctrl+Enter</span>
            </div>
          ) : (
            // Líneas de output — cada una con su color según el tipo
            <>
              {lines.map(line => (
                <span
                  key={line.id}
                  className={cn("block whitespace-pre-wrap break-all", LINE_CLASS[line.type])}
                >
                  {line.text}
                </span>
              ))}
              {/* Elemento invisible al final para el auto-scroll */}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
 