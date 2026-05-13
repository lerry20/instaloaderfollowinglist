import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app">
      <h1>Instaloader Following List</h1>
      <p>Vite + React + TypeScript PWA</p>
      <button onClick={() => setCount((c) => c + 1)}>
        count is {count}
      </button>
    </main>
  )
}
