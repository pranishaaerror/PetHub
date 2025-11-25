// frontend/src/App.js
import { useEffect, useState } from "react";
import axios from "axios";




function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
  }, []);





  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email} - {user.age}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
