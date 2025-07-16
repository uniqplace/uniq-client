import { Button } from 'primereact/button'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { useState } from 'react'
import { increment, decrement } from '../store'
import UserGreeting from '../components/shared/UserGreeting'


function Home() {
  const [count, setCount] = useState(0)
  const counter = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div>


      <UserGreeting />

      <h2>Home</h2>
      <Button label={`Local Count is ${count}`} icon="pi pi-plus" onClick={() => setCount(count + 1)} className="mr-2" />
      <Button label={`Redux Count is ${counter}`} icon="pi pi-plus" onClick={() => dispatch(increment())} className="mr-2" />
      <Button label="-" icon="pi pi-minus" onClick={() => dispatch(decrement())} severity="danger" />
    </div>
  )
}

export default Home
