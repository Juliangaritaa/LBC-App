import { useState, useEffect, useCallback } from "react";
import { LANG_CONFIG, LANG_KEYS } from '../lib/lagnConfig';
import type { LangKey } from "../lib/lagnConfig";
import { useCodeRunner } from '../hooks/useCodeRunner';
import { LangTab } from "../components/compiler/LangTab";
import { EditorPanel } from "..//components/compiler/EditorPanel";
import { OutputPanel } from "../components/compiler/OutputPanel";

function buildInitialCodes(): Record<LangKey, string> {
    return Object.fromEntries(
        LANG_KEYS.map(key => [key, ""])
    ) as Record<LangKey, string>
}

export default function CodeCompiler() {
    const [ activeLang, setActiveLang ] = useState<LangKey>("javascript")
    const [ codes, setCodes ] = useState<Record<LangKey, string>>(buildInitialCodes)
    const { lines, status, execTime, run, clear} = useCodeRunner()

    const config = LANG_CONFIG[activeLang]

    const handleRun = useCallback(() => {
        if (status === "running") return

        run({
            langId: config.langId,
            code: codes[activeLang],
        })
    }, [status, run, config, codes, activeLang])

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault()
            handleRun()
        }
        }
    
        window.addEventListener("keydown", onKeyDown)

        return () => window.removeEventListener("keydown", onKeyDown)
    }, [handleRun])

    function handleLangSwitch(lang: LangKey) {
        setActiveLang(lang)
        clear()
    }

    function handleCodeChange(newCode: string) {
        setCodes(prev => ({ ...prev, [activeLang]: newCode }))
    }

    return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans antialiased">
 
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/20 shrink-0">
        <span className="text-sm font-semibold tracking-widest text-primary/80 uppercase">
          LBC
        </span>
        <span className="text-xs text-muted-foreground">
          Learn By Compiler - compilador multi-lenguaje
        </span>
      </header>
 
      {/* ── Tabs de lenguaje ── */}
      {/*
        Los tabs viven en una barra separada del header.
        El -mb-px en el tab activo + border-b border-border acá crea el efecto
        de que el tab "se conecta" con el panel del editor de abajo.
      */}
      <div className="flex gap-1 px-4 pt-2 bg-muted/10 border-b border-border overflow-x-auto shrink-0">
        {LANG_KEYS.map(key => (
          <LangTab
            key={key}
            langKey={key}
            config={LANG_CONFIG[key]}
            active={activeLang === key}
            onClick={() => handleLangSwitch(key)}
          />
        ))}
      </div>
 
      {/* ── Main: editor + consola ── */}
      {/*
        flex-1 hace que esta sección ocupe todo el espacio restante de la pantalla.
        overflow-hidden evita scrolls indeseados en el contenedor padre —
        cada panel maneja su propio scroll internamente.
      */}
      <main className="flex flex-1 overflow-hidden">
        <EditorPanel
          config={config}
          code={codes[activeLang]}
          onChange={handleCodeChange}
          onRun={handleRun}
          running={status === "running"}
        />
        <OutputPanel
          lines={lines}
          status={status}
          execTime={execTime}
          onClear={clear}
          config={config}
        />
      </main>
 
      {/* ── Status bar ── */}
      <footer className="flex items-center gap-4 px-4 py-1.5 border-t border-border bg-muted/20 shrink-0">
        <span className="text-[10px] text-muted-foreground/40 font-sans antialiased">
          Ctrl+Enter → ejecutar
        </span>
        <span className="text-[10px] text-muted-foreground/40 font-sans antialiased">
          Tab → 2 espacios
        </span>
      </footer>
    </div>
  )
}