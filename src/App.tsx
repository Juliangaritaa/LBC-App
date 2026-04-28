import './App.css'
import CodeCompiler from './pages/CodeCompiler'
import { Toaster } from "./components/ui/sonner"

function App() {

  return (
    <>
    <CodeCompiler>
    </CodeCompiler>
    <Toaster position="top-right" richColors />
    </>
  )
}

export default App
