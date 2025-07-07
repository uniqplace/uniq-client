import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './App.css'
import { increment, decrement } from './store'
import Marketplace from './pages/Marketplace'
import Orders from './pages/Orders'

function Home() {
  const [count, setCount] = useState(0)
  const counter = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch<AppDispatch>()
  return (
    <div>
      <h2>Home</h2>
      <Button label={`Local Count is ${count}`} icon="pi pi-plus" onClick={() => setCount(count + 1)} className="mr-2" />
      <Button label={`Redux Count is ${counter}`} icon="pi pi-plus" onClick={() => dispatch(increment())} className="mr-2" />
      <Button label="-" icon="pi pi-minus" onClick={() => dispatch(decrement())} severity="danger" />
    </div>
  )
}

function About() {
  return <h2>About Page</h2>
}

function App() {
  return (
    <div>
      <nav className="p-4 bg-gray-100">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          <Link to="/marketplace" className="text-blue-600 hover:text-blue-800">Marketplace</Link>
          <Link to="/orders" className="text-blue-600 hover:text-blue-800">Orders</Link>
          <Link to="/about" className="text-blue-600 hover:text-blue-800">About</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
