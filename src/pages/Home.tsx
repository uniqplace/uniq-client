import { useSelector } from "react-redux";
import UserCard from "../components/shared/UserCard";

function Home() {
  const user = useSelector((state: any) => state.user);
  return (
    <div>
      <div className="p-6">
        Home Page
      </div>
      <UserCard user={{
        id: "687cf0e4f2e8ed1cf5545add",
        name: "Pnini",
        email: "p0548590@gmail.com",
        avatarUrl: "https://res.cloudinary.com/ddrsfqqwv/image/upload/v1757511058/UniqImage/default/temp/8ff1526cbca534671201f98a5dae4def.jpg",
        bio: "",
        role: "creator",
      }} userType="creator" />
      <UserCard user={user} userType="creator" />
    </div>
  );
}

export default Home;
