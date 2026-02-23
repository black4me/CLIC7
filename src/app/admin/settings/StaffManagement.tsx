'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Mail, Calendar, User as UserIcon, Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface APIStaffPermission {
    permission: string;
    canPerform: boolean;
}

interface APIStaffMember {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'supervisor' | 'staff' | 'support' | 'owner';
    isActive: boolean;
    createdAt: string;
    permissions: APIStaffPermission[];
}

const VALID_PERMISSIONS = [
    { key: 'view_orders', label: 'View Orders' },
    { key: 'manage_orders', label: 'Manage Orders' },
    { key: 'verify_payments', label: 'Verify Payments' },
    { key: 'manage_products', label: 'Manage Products' },
    { key: 'manage_staff', label: 'Manage Staff' },
    { key: 'manage_settings', label: 'Manage Settings' },
    { key: 'view_reports', label: 'View Reports' },
    { key: 'manage_customers', label: 'Manage Customers' },
    { key: 'admin', label: 'Full Admin Access' }
];

export default function StaffManagement() {
    const [staff, setStaff] = useState<APIStaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'profile'>('members');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'staff' as APIStaffMember['role'],
        permissions: [] as string[]
    });
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        role: ''
    });

    // Fetch staff from API
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/staff');
            const data = await res.json();
            if (data.success) {
                setStaff(data.data || []);
            } else {
                toast.error(data.message || 'Failed to fetch staff list');
            }
        } catch (error) {
            toast.error('Network error while fetching staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Load profile from local storage session for "My Profile" tab
    useEffect(() => {
        const storedUser = localStorage.getItem('clic7_current_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || ''
            });
        }
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const method = editMode ? 'PATCH' : 'POST';
            const url = editMode ? `/api/admin/staff/${editingId}` : '/api/admin/staff';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(editMode ? 'Staff member updated' : 'Staff member added. Welcome email sent.');
                setIsModalOpen(false);
                fetchStaff();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member: APIStaffMember) => {
        setFormData({
            fullName: member.fullName,
            email: member.email,
            role: member.role,
            permissions: member.permissions.map(p => p.permission)
        });
        setEditingId(member.id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleRemove = async (id: string, role: string) => {
        if (role === 'owner') {
            toast.error('Cannot remove the Store Owner');
            return;
        }
        if (confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) {
            try {
                const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    toast.success('Staff member removed');
                    fetchStaff();
                } else {
                    toast.error(data.message || 'Failed to remove staff');
                }
            } catch (error) {
                toast.error('Connection error');
            }
        }
    };

    const togglePermission = (permKey: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permKey)
                ? prev.permissions.filter(p => p !== permKey)
                : [...prev.permissions, permKey]
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-primary" />
                        Staff & Granular Permissions
                    </h2>
                    <p className="text-gray-400 text-sm">Manage database-backed staff access roles</p>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'members' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Team Members
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        My Profile
                    </button>
                </div>
            </div>

            {loading && !isModalOpen ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : activeTab === 'members' ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setEditMode(false);
                                setEditingId(null);
                                setFormData({ fullName: '', email: '', role: 'staff', permissions: [] });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={16} />
                            Add Staff Member
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {staff.map((member) => (
                            <div key={member.id} className="bg-[#1A1A1A] border border-white/5 p-5 rounded-2xl flex flex-col gap-4 group hover:border-primary/30 transition-all relative overflow-hidden ring-1 ring-white/5">
                                {member.role === 'owner' && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 -rotate-45 translate-x-12 -translate-y-12 flex items-end justify-center pb-2">
                                        <ShieldAlert className="text-primary w-4 h-4 ml-6 mb-2" />
                                    </div>
                                )}

                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary border border-white/5">
                                        <UserIcon size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            title="Edit Permissions"
                                        >
                                            <Shield size={18} />
                                        </button>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => handleRemove(member.id, member.role)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Remove Member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{member.fullName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                        <Mail size={14} />
                                        {member.email}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                                        <span>Permissions</span>
                                        <span>{member.permissions.filter(p => p.canPerform).length} Active</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {member.role === 'owner' ? (
                                            <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded-md font-bold uppercase">All Privileges</span>
                                        ) : member.permissions.filter(p => p.canPerform).slice(0, 3).map(p => (
                                            <span key={p.permission} className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 border border-white/10 rounded-md">
                                                {p.permission.replace('_', ' ')}
                                            </span>
                                        ))}
                                        {member.role !== 'owner' && member.permissions.filter(p => p.canPerform).length > 3 && (
                                            <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-500 rounded-md">+{member.permissions.filter(p => p.canPerform).length - 3}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                    <div className="flex flex-col gap-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${member.role === 'owner' ? 'bg-primary/20 text-primary border-primary/30' :
                                                member.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                    'bg-green-500/20 text-green-400 border-green-500/30'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-600 flex items-center gap-1 font-medium">
                                        <Calendar size={12} />
                                        Joined {new Date(member.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-[#1A1A1A] border border-white/5 p-8 rounded-3xl animate-in slide-in-from-right-4 duration-500 max-w-2xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />

                    <div className="flex items-center gap-5 mb-10 relative z-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <UserIcon size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Admin Account Profile</h3>
                            <p className="text-gray-500 font-medium">System Role: <span className="text-primary font-bold">{profileData.role}</span></p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold opacity-80 cursor-not-allowed">
                                    {profileData.name}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Work Email</label>
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold opacity-80 cursor-not-allowed">
                                    {profileData.email}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                            <div className="mt-1">
                                <Shield className="text-blue-400 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-blue-400 font-bold mb-1">Role-Based Protection</h4>
                                <p className="text-blue-400/70 text-sm leading-relaxed">
                                    Your account is protected by hardware-level security policies.
                                    Profile changes are currently restricted to terminal-only access by the System Owner for maximum security.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="w-full max-w-2xl bg-[#12121A] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                    {editMode ? 'Edit Staff Privileges' : 'Provision New Staff'}
                                </h2>
                                <p className="text-gray-500 text-sm">Define access boundaries for team members</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
                                        <input
                                            required
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary outline-none transition-all font-bold placeholder:text-gray-700"
                                            placeholder="Enter full name"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-primary outline-none transition-all font-bold placeholder:text-gray-700"
                                            placeholder="staff@clic7.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Role</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                    >
                                        <option value="staff">Staff - Basic operational access</option>
                                        <option value="supervisor">Supervisor - Team management & reviews</option>
                                        <option value="admin">Administrator - System wide management</option>
                                        <option value="support">Support - Customer service only</option>
                                        {formData.role === 'owner' && <option value="owner">Owner - Root level access</option>}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Granular Permissions</label>
                                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Access boundaries</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {VALID_PERMISSIONS.map((perm) => (
                                        <button
                                            key={perm.key}
                                            type="button"
                                            onClick={() => togglePermission(perm.key)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${formData.permissions.includes(perm.key)
                                                    ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10'
                                                    : 'bg-black/30 border-white/5 text-gray-500 hover:border-white/20'
                                                }`}
                                        >
                                            <span className="text-xs font-bold">{perm.label}</span>
                                            {formData.permissions.includes(perm.key) ? (
                                                <div className="bg-primary rounded-full p-0.5">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            ) : (
                                                <div className="bg-white/10 rounded-full p-0.5">
                                                    <Plus size={12} className="text-transparent" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all font-bold uppercase text-xs tracking-widest"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-primary/20 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        editMode ? 'Update Privileges' : 'Deploy Staff Member'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
