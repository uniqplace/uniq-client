import { Button } from 'primereact/button'
import { useState, useEffect } from 'react'
import { Avatar } from 'primereact/avatar';
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import UserGreeting from '../components/shared/UserGreeting'


function Home() {
  const [count, setCount] = useState(0)
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div>


      <UserGreeting />

      <h2>Home</h2>
      <Button label={`Local Count is ${count}`} icon="pi pi-plus" onClick={() => setCount(count + 1)} className="mr-2" />
    </div>
  )
}

export default Home
