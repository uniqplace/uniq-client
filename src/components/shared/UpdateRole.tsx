import { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Cookies from 'js-cookie';
import axios from 'axios';
import type { RoleType, User } from '../../types/index';

interface UpdateRoleProps {
  currentRole: RoleType;
  onRoleUpdated: (user: User) => void;
  onCancel: () => void;
  roleOptions: { label: string; value: RoleType }[];
}

const UpdateRole: React.FC<UpdateRoleProps> = ({ currentRole, onRoleUpdated, onCancel, roleOptions }) => {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole || 'customer');
  const [loading, setLoading] = useState(false);

  const handleUpdateRole = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const res = await axios.put(
        '/api/auth/role',
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success && res.data.user) {
        onRoleUpdated(res.data.user);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 60, right: 10, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px #ccc' }}>
      <Dropdown
        value={selectedRole}
        options={roleOptions}
        onChange={(e) => setSelectedRole(e.value as RoleType)}
        placeholder="Select Role"
        style={{ width: 180, marginBottom: 8 }}
      />
      <Button label="Save" onClick={handleUpdateRole} loading={loading} className="mr-2" />
      <Button label="Cancel" onClick={onCancel} severity="secondary" />
    </div>
  );
};

export default UpdateRole;