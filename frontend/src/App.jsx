import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:8000/api/test/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Error fetching backend'))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">AI Notes App</h1>
      <p>{message}</p>
    </div>
  )
}

export default App
