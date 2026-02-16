const TaskList = ({ tasks }) => {
  // Helper to get priority styles
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200">
        <p className="text-slate-500">No tasks yet. Try adding one!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-200 w-full">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Tasks</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b">Title</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b">Description</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b">Priority</th> {/* NEW COLUMN */}
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b">Created</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 border-b">Due</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const due = new Date(task.dueDate);
              const now = new Date();
              const isOverdue = !task.isCompleted && due < now;

              return (
                <tr
                  key={task.id}
                  className={`transition-colors ${
                    isOverdue
                      ? 'bg-red-50 hover:bg-red-100/70'
                      : 'odd:bg-white even:bg-slate-50 hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 border-b">
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 border-b">
                    {task.description}
                  </td>
                  {/* NEW PRIORITY CELL */}
                  <td className="px-4 py-3 text-sm border-b">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityStyles(task.priority)}`}>
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 border-b">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 border-b">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center border-b">
                    <span
                      className={`inline-flex items-center justify-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${
                        task.isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isOverdue
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {task.isCompleted ? 'Done' : isOverdue ? 'Overdue' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;