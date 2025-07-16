import { Button } from 'primereact/button'
import { useState } from 'react'
import { Avatar } from 'primereact/avatar';
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { setUser } from '../features/marketplace/slices/userSlice'
import UpdateRole from '../components/shared/UpdateRole'
import type { RoleType, User } from '../types/index';
import { roleOptions } from '../constants/roles';

function Home() {


  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.user);

  const [showRoleUpdate, setShowRoleUpdate] = useState(false);
  
  const getInitialRole = (role: string | null | undefined): RoleType => {
    const allowed: RoleType[] = ['customer', 'manufacturer', 'creator', 'admin'];
    return allowed.find(r => r === role) ?? 'customer';
  };

  const handleRoleUpdated = (updatedUser: User) => {
    const userWithRole = {
      ...updatedUser,
      role: updatedUser.role ?? 'customer', // או ערך ברירת מחדל מתאים
    };

    dispatch(setUser(userWithRole));
    localStorage.setItem('user', JSON.stringify(userWithRole));
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
      <p>Welcome to the home page!</p>
      {/* <Button label="Increment" onClick={() => dispatch(increment())} />
      <Button label="Decrement" onClick={() => dispatch(decrement())} /> */}
    </div>
  );
}

export default Home;
