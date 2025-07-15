import { Button } from 'primereact/button'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { useState, useEffect } from 'react'
import { increment, decrement } from '../store'
import { Avatar } from 'primereact/avatar';

function Home() {
  const [count, setCount] = useState(0)
  const counter = useSelector((state: RootState) => state.counter.value)
  const dispatch = useDispatch<AppDispatch>()

  
  const [userName, setUserName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.fullName || user.name || '');
        setAvatarUrl(user.avatar || null);
      } catch {
        setUserName('');
        setAvatarUrl(null);
      }
    }
  }, [])

  return (
    <div>
      {userName && (
        <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 10, right: 10, gap: 8 }}>
          <h2 style={{ margin: 0 }}>
            Hi {userName}!
          </h2>
          <Avatar
            label={userName ? userName.charAt(0).toUpperCase() : 'V'}
            size="large"
            style={{ backgroundColor: '#2196F3', color: '#ffffff', marginLeft: 8 }}
            shape="circle"
          />
        </div>
      )}
      <h2>Home</h2>
      <Button label={`Local Count is ${count}`} icon="pi pi-plus" onClick={() => setCount(count + 1)} className="mr-2" />
      <Button label={`Redux Count is ${counter}`} icon="pi pi-plus" onClick={() => dispatch(increment())} className="mr-2" />
      <Button label="-" icon="pi pi-minus" onClick={() => dispatch(decrement())} severity="danger" />
    </div>
  )
}
export default Home;