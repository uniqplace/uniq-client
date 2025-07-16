import { Button } from 'primereact/button'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { useState } from 'react'
import { increment, decrement } from '../store'
import { Avatar } from 'primereact/avatar'
import { Dropdown } from 'primereact/dropdown'
import { setUser } from '../features/marketplace/slices/userSlice'
import Cookies from 'js-cookie'
import UpdateRole from '../components/shared/UpdateRole'
import type { RoleType, User } from '../types/index';

const roleOptions: { label: string; value: RoleType }[] = [
  { label: 'Customer', value: 'customer' },
  { label: 'Manufacturer', value: 'manufacturer' },
  { label: 'Creator', value: 'creator' },
  { label: 'Admin', value: 'admin' }, // אם צריך גם admin
];

function Home() {
  const [count, setCount] = useState(0);
  const counter = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.user);
  const [showRoleUpdate, setShowRoleUpdate] = useState(false);
  
  const getInitialRole = (role: string | null | undefined): RoleType => {
    const allowed: RoleType[] = ['customer', 'manufacturer', 'creator', 'admin'];
    return allowed.includes(role as RoleType) ? (role as RoleType) : 'customer';
  };

  const [selectedRole, setSelectedRole] = useState<RoleType>(getInitialRole(user.role));

  const handleRoleUpdated = (updatedUser: any) => {
    dispatch(setUser(updatedUser));
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowRoleUpdate(false);
  };

  return (
    <div>
      {user.name && (
        <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: 10, right: 10, gap: 8 }}>
          <h2 style={{ margin: 0 }}>
            Hi {user.name}!
          </h2>
          <Avatar
            label={user.name.charAt(0).toUpperCase()}
            size="large"
            style={{ backgroundColor: '#2196F3', color: '#ffffff', marginLeft: 8 }}
            shape="circle"
          />
          <Button label="Update Role" onClick={() => setShowRoleUpdate(true)} className="ml-2" />
        </div>
      )}

      {showRoleUpdate && (
        <UpdateRole
          currentRole={getInitialRole(user.role)}
          onRoleUpdated={handleRoleUpdated}
          onCancel={() => setShowRoleUpdate(false)}
          roleOptions={roleOptions}
        />
      )}

      <h2>Home</h2>
      <Button label={`Local Count is ${count}`} icon="pi pi-plus" onClick={() => setCount(count + 1)} className="mr-2" />
      <Button label={`Redux Count is ${counter}`} icon="pi pi-plus" onClick={() => dispatch(increment())} className="mr-2" />
      <Button label="-" icon="pi pi-minus" onClick={() => dispatch(decrement())} severity="danger" />
    </div>
  );
}

export default Home;
