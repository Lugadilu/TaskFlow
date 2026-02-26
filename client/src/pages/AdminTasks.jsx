import { useEffect, useState } from "react";
import { adminApi } from "../services/api";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const data = await adminApi.getAllTasks();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    await adminApi.forceDeleteTask(id);
    fetchTasks();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Tasks</h1>

      <table className="w-full bg-white rounded-lg shadow">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th>User</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-t">
              <td className="p-3">{task.title}</td>
              <td>{task.assignedToUsername}</td>
              <td>{task.isCompleted ? "Completed" : "Active"}</td>
              <td>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Force Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTasks;