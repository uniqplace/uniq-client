import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
}

const getUserIdFromToken = (): string | null => {
  const token = Cookies.get('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id || null;
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};

export default getUserIdFromToken;