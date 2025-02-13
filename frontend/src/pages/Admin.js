import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Access Denied", err);
      }
    };

    console.log(user?.username)
    if (user?.role === "admin") fetchUsers();
  }, [user]);

  if (!user || user.role !== "admin") return <h2>Access Denied</h2>;

  return (
    <div>
      <h2>Admin Panel</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username} - {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
