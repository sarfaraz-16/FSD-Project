import React, { useState, useEffect, useCallback, useContext } from 'react';
import { getUsers, createUser, updateUser, getEmployees } from '../../services/hrService';
import { Plus, Search, Edit2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : (res?.data || []));
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployeesList = async () => {
    try {
      const res = await getEmployees({ limit: 1000 });
      setEmployees(res?.items || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error(e);
      setEmployees([]);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
    fetchEmployeesList();
  }, [fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const form = e.target;
    
    const data = {
      role: form.role.value,
      isActive: form.isActive.value === 'true',
      employeeId: form.employeeId?.value ? form.employeeId.value : null
    };

    if (!editing) {
      data.name = form.name.value;
      data.email = form.email.value;
      data.password = form.password.value;
    } else if (form.password?.value) {
      data.password = form.password.value;
    }

    try {
      if (editing) await updateUser(editing._id, data);
      else await createUser(data);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error saving user');
    }
  };

  const filteredUsers = (users || []).filter(u => 
    (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-slate-200">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <button 
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Linked Employee</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{u.name}</td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4 capitalize text-slate-600">{u.role}</td>
                <td className="p-4 text-slate-600">{u.employeeId ? u.employeeId.name : <span className="text-slate-400 italic">None</span>}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.isActive ? 'bg-success-bg text-success-text' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => { setEditing(u); setShowModal(true); }} className="text-primary hover:text-primary-hover p-1">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filteredUsers.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit User' : 'New User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            {errorMsg && <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {!editing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input required name="name" className="w-full border border-slate-300 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input required type="email" name="email" className="w-full border border-slate-300 rounded-lg p-2" />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editing ? 'Reset Password (optional)' : 'Password'}
                </label>
                <input required={!editing} minLength={6} type="password" name="password" placeholder={editing ? 'Leave blank to keep current' : ''} className="w-full border border-slate-300 rounded-lg p-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role" defaultValue={editing?.role || 'staff'} disabled={editing?._id === currentUser._id} className="w-full border border-slate-300 rounded-lg p-2 disabled:bg-slate-100">
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link Employee (Optional)</label>
                <select
                  name="employeeId"
                  defaultValue={editing?.employeeId?._id || editing?.employeeId || ''}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="">-- None --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="isActive" defaultValue={editing ? String(editing.isActive) : 'true'} disabled={editing?._id === currentUser._id} className="w-full border border-slate-300 rounded-lg p-2 disabled:bg-slate-100">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
export default Users;
