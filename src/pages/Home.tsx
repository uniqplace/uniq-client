import { Button } from 'primereact/button'
import { useState } from 'react'
import { Avatar } from 'primereact/avatar';
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { setUser } from '../features/marketplace/slices/userSlice'
import UpdateRole from '../components/shared/UpdateRole'
import UserGreeting from '../components/shared/UserGreeting';
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
      role: updatedUser.role ?? 'customer', 
    };

    dispatch(setUser(userWithRole));
    localStorage.setItem('user', JSON.stringify(userWithRole));
    setShowRoleUpdate(false);
  };

  return (
    <div>

      <UserGreeting />

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
    </div>
  );
}

export default Home;
