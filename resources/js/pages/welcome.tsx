import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Task {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    color?: string;
}

export default function Welcome() {
    const [viewMode, setViewMode] = useState<'detail' | 'Simpel'>('detail');
    const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 13)); // 13 Juni 2026
    
    const [selectedDateTasks, setSelectedDateTasks] = useState<Task[] | null>(null);
    const [selectedDateStr, setSelectedDateStr] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // State drag dipertahankan seminimal mungkin hanya untuk efek opacity kartu saat digeser
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('2026-06-13');
    const [newTaskTime, setNewTaskTime] = useState('09:00');

    // Data Dummy Terdistribusi Akurat
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Setup database PostgreSQL & Schema Migrations', date: '2026-06-13', time: '09:00', color: 'bg-amber-100/80 border-amber-300 text-amber-950' },
        { id: '2', title: 'Implementasi auth Inertia dengan Laravel Breeze', date: '2026-06-13', time: '11:30', color: 'bg-blue-100/80 border-blue-300 text-blue-950' },
        { id: '3', title: 'Desain layout dashboard di Figma (draft kedua)', date: '2026-06-13', time: '14:00', color: 'bg-purple-100/80 border-purple-300 text-purple-950' },
        { id: '4', title: 'Selesaikan modul Microservices Java di Dicoding', date: '2026-06-13', time: '16:00', color: 'bg-emerald-100/80 border-emerald-300 text-emerald-950' },
        
        { id: '5', title: 'Standup Meeting - NovaBoard Team', date: '2026-06-15', time: '10:00', color: 'bg-pink-100/80 border-pink-300 text-pink-950' },
        { id: '6', title: 'UX Audit Sync - Waveflow Studio', date: '2026-06-15', time: '11:00', color: 'bg-cyan-100/80 border-cyan-300 text-cyan-950' },
        { id: '7', title: 'Frontend Dev Sync - API Mapping Task', date: '2026-06-16', time: '10:15', color: 'bg-fuchsia-100/80 border-fuchsia-300 text-fuchsia-950' },
        { id: '8', title: 'Sprint Check-in - Tasklio', date: '2026-06-16', time: '11:00', color: 'bg-orange-100/80 border-orange-300 text-orange-950' },
        { id: '9', title: 'UX Huddle Call', date: '2026-06-17', time: '09:00', color: 'bg-sky-100/80 border-sky-300 text-sky-950' },
        { id: '10', title: 'Design Sync - Website Revamp', date: '2026-06-17', time: '10:00', color: 'bg-indigo-100/80 border-indigo-300 text-indigo-950' },
        { id: '11', title: 'Analytics Kickoff - Formix Insights', date: '2026-06-18', time: '09:00', color: 'bg-amber-100/80 border-amber-300 text-amber-950' },
        { id: '12', title: 'Team Feedback Loop: Task Management UI', date: '2026-06-18', time: '11:15', color: 'bg-violet-100/80 border-violet-300 text-violet-950' },
    ]);

    const hourlySlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    const formatDateKey = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        const offset = direction === 'prev' ? -1 : 1;
        const newDate = new Date(currentDate);
        if (viewMode === 'detail') {
            newDate.setDate(newDate.getDate() + (offset * 7));
        } else if (viewMode === 'Simpel') {
            newDate.setMonth(newDate.getMonth() + offset);
        }
        setCurrentDate(newDate);
    };

    const dateLabel = useMemo(() => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        if (viewMode === 'detail') {
            const currentDay = currentDate.getDay();
            const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            const monday = new Date(currentDate);
            monday.setDate(currentDate.getDate() + distanceToMonday);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return `${monday.getDate()} - ${sunday.getDate()} ${months[monday.getMonth()]} ${monday.getFullYear()}`;
        } else {
            return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    }, [currentDate, viewMode]);

    // PROTEKSI GLOBAL FAIL-SAFE
    useEffect(() => {
        const globalDragEnd = () => setActiveDragId(null);
        window.addEventListener('dragend', globalDragEnd);
        return () => window.removeEventListener('dragend', globalDragEnd);
    }, []);

    // ================= DRAG & DROP CODES =================
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId);
        setActiveDragId(taskId);
    };

    const handleDragEnd = () => {
        setActiveDragId(null);
    };

    const handleDropTaskWeek = (e: React.DragEvent, targetDateStr: string, targetHour: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (!taskId) return;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, date: targetDateStr, time: targetHour } : t));
    };

    const handleDeleteTaskDirect = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const colors = ['bg-amber-100/80 border-amber-300 text-amber-950', 'bg-blue-100/80 border-blue-300 text-blue-950', 'bg-purple-100/80 border-purple-300 text-purple-950', 'bg-emerald-100/80 border-emerald-300 text-emerald-950'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        setTasks(prev => [...prev, { id: String(Date.now()), title: newTaskTitle, date: newTaskDate, time: newTaskTime, color: randomColor }]);
        setNewTaskTitle('');
        setIsCreateModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased overflow-hidden">
            <Head title="projek itulah" />

            {/* ================= NAVBAR STABIL ================= */}
            <header className="w-full bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm shrink-0 relative z-20">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-extrabold">BD</div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-sm md:text-base tracking-tight leading-tight">Bell</h2>
                        <p className="text-[11px] text-slate-400 font-bold">Pengangguran</p>
                    </div>
                </div>

                <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
                    <button onClick={() => setViewMode('detail')} className={`px-6 py-1.5 rounded-xl text-xs font-black capitalize transition-all duration-300 ${viewMode === 'detail' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>detail</button>
                    <button onClick={() => setViewMode('Simpel')} className={`px-6 py-1.5 rounded-xl text-xs font-black capitalize transition-all duration-300 ${viewMode === 'Simpel' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>Simpel</button>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                        <button onClick={() => handleNavigate('prev')} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                        <p className="font-black text-slate-800 text-sm mt-0.5">{dateLabel}</p>
                        <button onClick={() => handleNavigate('next')} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                    </div>
                    <button 
                        onClick={() => { setNewTaskDate(formatDateKey(currentDate)); setIsCreateModalOpen(true); }} 
                        className="bg-slate-950 text-white p-2.5 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </header>

            {/* ================= AREA KONTEN UTAMA LEGA (FIXED LAYOUT SHIFT) ================= */}
            <div className="flex-1 flex w-full overflow-hidden relative">
                
                {/* AREA KALENDER: Lebar stabil penuh 100% tanpa adanya mr-[240px] yang bikin UI lompat */}
                <main className="flex-1 p-6 overflow-y-auto relative z-10">

                    {/* MODE detail */}
                    {viewMode === 'detail' && (
                        <div className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-x-auto">
                            <div className="min-w-[1000px]">
                                
                                <div className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-slate-100 pb-4 mb-2 text-center items-center">
                                    <div className="text-xs font-black text-slate-400 text-left pl-2">GMT+07</div>
                                    {Array.from({ length: 7 }).map((_, idx) => {
                                        const currentDay = currentDate.getDay();
                                        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
                                        const targetDayDate = new Date(currentDate);
                                        targetDayDate.setDate(currentDate.getDate() + distanceToMonday + idx);
                                        
                                        const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                        const isToday = formatDateKey(new Date()) === formatDateKey(targetDayDate);

                                        return (
                                            <div key={idx} className={`flex flex-col items-center py-1 rounded-xl ${isToday ? 'bg-rose-50 border border-rose-200/60 px-2' : ''}`}>
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isToday ? 'text-rose-500' : 'text-slate-400'}`}>{daysNames[idx]}</span>
                                                <span className={`text-2xl font-black mt-0.5 ${isToday ? 'text-rose-600' : 'text-slate-800'}`}>{targetDayDate.getDate()}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="divide-y divide-slate-100/60">
                                    {hourlySlots.map((hour) => (
                                        <div key={hour} className="grid grid-cols-[90px_repeat(7,1fr)] min-h-[90px] py-2 items-start group">
                                            <div className="text-xs font-extrabold text-slate-400/80 pt-1 text-left pl-2 group-hover:text-slate-600 transition-colors">
                                                {parseInt(hour) < 12 ? `${hour} AM` : `${hour} PM`}
                                            </div>

                                            {Array.from({ length: 7 }).map((_, dayIdx) => {
                                                const currentDay = currentDate.getDay();
                                                const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
                                                const targetDayDate = new Date(currentDate);
                                                targetDayDate.setDate(currentDate.getDate() + distanceToMonday + dayIdx);
                                                
                                                const dateStr = formatDateKey(targetDayDate);
                                                const matchedTasks = tasks.filter(t => t.date === dateStr && t.time.startsWith(hour.split(':')[0]));

                                                return (
                                                    <div 
                                                        key={dayIdx} 
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={(e) => handleDropTaskWeek(e, dateStr, hour)}
                                                        className="px-2 h-full min-h-[75px] border-l border-slate-100/50 flex flex-col gap-1.5 justify-start transition-colors hover:bg-slate-50/20"
                                                    >
                                                        {matchedTasks.map(t => (
                                                            <div 
                                                                key={t.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, t.id)}
                                                                onDragEnd={handleDragEnd}
                                                                className={`p-3.5 rounded-xl border text-xs font-black shadow-sm leading-snug transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:shadow-md relative group/item flex justify-between items-start gap-2 ${t.color}`}
                                                            >
                                                                <p className="font-extrabold tracking-tight leading-normal flex-1">{t.title}</p>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTaskDirect(t.id); }}
                                                                    className="opacity-0 group-hover/item:opacity-100 text-rose-500 font-bold text-[10px] w-4 h-4 rounded hover:bg-rose-100 flex items-center justify-center transition-all shrink-0"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                                
                            </div>
                        </div>
                    )}

                    {/* MODE Simpel */}
                    {viewMode === 'Simpel' && (
                        <div className="flex flex-col bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[500px]">
                            <div className="grid grid-cols-7 gap-2 text-center font-black text-[11px] text-slate-400 uppercase tracking-widest mb-4">
                                {['minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-3 flex-1 items-stretch">
                                {(() => {
                                    const y = currentDate.getFullYear();
                                    const m = currentDate.getMonth();
                                    const firstDayIndex = new Date(y, m, 1).getDay();
                                    const totalDays = new Date(y, m + 1, 0).getDate();
                                    const gridCells = [];

                                    for (let i = 0; i < firstDayIndex; i++) {
                                        gridCells.push(<div key={`empty-${i}`} className="bg-slate-50/40 border border-slate-100 rounded-2xl opacity-25"></div>);
                                    }

                                    for (let day = 1; day <= totalDays; day++) {
                                        const dObj = new Date(y, m, day);
                                        const dKey = formatDateKey(dObj);
                                        const dTasks = tasks.filter(t => t.date === dKey);
                                        const isToday = formatDateKey(new Date()) === dKey;

                                        gridCells.push(
                                            <button key={`day-${day}`} onClick={() => { setSelectedDateTasks(dTasks); setSelectedDateStr(dKey); }} className={`bg-white border border-slate-100 rounded-2xl p-3 flex flex-col justify-between items-start hover:border-slate-300 hover:shadow-md transition text-left min-h-[90px] ${isToday ? 'ring-2 ring-rose-500/40 bg-rose-50/10' : ''}`}>
                                                <span className={`text-xs font-black ${isToday ? 'text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded-md' : 'text-slate-700'}`}>{day}</span>
                                                <div className="flex gap-1 mt-auto pt-4">
                                                    {dTasks.map(t => (
                                                        <span key={t.id} className="w-2 h-2 rounded-full bg-slate-400 block shadow-sm"></span>
                                                    ))}
                                                </div>
                                            </button>
                                        );
                                    }
                                    return gridCells;
                                })()}
                            </div>
                        </div>
                    )}
                </main>

            </div>

            {/* ================= MODALS DETAILED POP-UPS ================= */}
            {selectedDateTasks !== null && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl border">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <div>
                                <h3 className="text-base font-black text-slate-800">Daftar Rencana</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5">{selectedDateStr}</p>
                            </div>
                            <button onClick={() => setSelectedDateTasks(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center">✕</button>
                        </div>
                        <div className="py-4 space-y-3 max-h-[300px] overflow-y-auto">
                            {selectedDateTasks.map(t => (
                                <div key={t.id} className="p-4 bg-slate-50 border rounded-2xl flex items-center justify-between shadow-sm">
                                    <p className="text-xs font-extrabold text-slate-800">{t.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400">{t.time} WIB</span>
                                        <button onClick={() => { handleDeleteTaskDirect(t.id); setSelectedDateTasks(null); }} className="text-xs text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t flex gap-3">
                            <button onClick={() => { setNewTaskDate(selectedDateStr); setIsCreateModalOpen(true); setSelectedDateTasks(null); }} className="flex-1 bg-slate-950 text-white font-extrabold text-xs py-3.5 rounded-xl">+ Tambah Tugas Baru</button>
                            <button onClick={() => setSelectedDateTasks(null)} className="flex-1 bg-slate-100 text-slate-600 font-extrabold text-xs py-3.5 rounded-xl">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h3 className="text-base font-black text-slate-800">Masukkan Note</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center">✕</button>
                        </div>
                        <form onSubmit={handleAddTask} className="py-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Note</label>
                                <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs text-slate-800 font-bold focus:outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Tanggal</label>
                                    <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Waktu</label>
                                    <input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs font-bold" />
                                </div>
                            </div>
                            <div className="pt-4 border-t flex gap-3">
                                <button type="submit" className="flex-1 bg-slate-950 text-white font-extrabold text-xs py-3.5 rounded-xl">Simpan Rencana</button>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-extrabold text-xs py-3.5 rounded-xl">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}