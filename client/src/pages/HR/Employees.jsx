import React, { useState, useEffect, useCallback, useContext } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/hrService';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Employees = () => {
  const { user } = useContext(AuthContext);
  const canEdit = user?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmployees({ search });
      setEmployees(res?.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      department: form.department.value,
      designation: form.designation.value,
      joinDate: form.joinDate.value,
      status: form.status.value
    };

    try {
      if (editing) await updateEmployee(editing._id, data);
      else await createEmployee(data);
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Error saving employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-slate-200">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center font-medium"
          >
            <Plus size={20} className="mr-2" />
            Add Employee
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium">Designation</th>
              <th className="p-4 font-medium">Status</th>
              {canEdit && <th className="p-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{emp.name}</td>
                <td className="p-4 text-slate-600">{emp.department}</td>
                <td className="p-4 text-slate-600">{emp.designation}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    emp.status === 'active' ? 'bg-success-bg text-success-text' : 'bg-red-100 text-red-700'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                {canEdit && (
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setEditing(emp); setShowModal(true); }} className="text-primary hover:text-primary-hover p-1" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(emp._id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!loading && employees.length === 0 && (
              <tr><td colSpan={canEdit ? "5" : "4"} className="p-8 text-center text-slate-500">No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Employee' : 'New Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input required name="name" defaultValue={editing?.name} className="w-full border border-slate-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input required name="department" defaultValue={editing?.department} className="w-full border border-slate-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                <input required name="designation" defaultValue={editing?.designation} className="w-full border border-slate-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                <input required type="date" name="joinDate" defaultValue={editing?.joinDate?.split('T')[0]} className="w-full border border-slate-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" defaultValue={editing?.status || 'active'} className="w-full border border-slate-300 rounded-lg p-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Employees;
