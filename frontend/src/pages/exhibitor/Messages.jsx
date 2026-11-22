import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Send, MessageSquare } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const socket   = useSocket(user?._id);

  const [threads,  setThreads]  = useState([]);
  const [active,   setActive]   = useState(null);
  const [msgs,     setMsgs]     = useState([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/messages/inbox').then(r => setThreads(r.data.data));
  }, []);

  useEffect(() => {
    if (!active) return;
    const otherId = active.sender._id === user._id ? active.receiver._id : active.sender._id;
    api.get(`/messages/conversation/${otherId}`).then(r => setMsgs(r.data.data));
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new-message', (msg) => {
      setMsgs(prev => [...prev, msg]);
      toast('New message received');
    });
    return () => socket.off('new-message');
  }, [socket]);

  const send = async () => {
    if (!text.trim() || !active) return;
    setSending(true);
    const otherId = active.sender._id === user._id ? active.receiver._id : active.sender._id;
    try {
      const { data } = await api.post('/messages', { receiverId: otherId, content: text.trim() });
      setMsgs(prev => [...prev, data.data]);
      setText('');
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  const getOther = (thread) => thread.sender._id === user._id ? thread.receiver : thread.sender;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex">
        {/* Thread list */}
        <div className="w-72 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800"><h2 className="font-semibold text-white">Messages</h2></div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 && <p className="text-slate-500 text-sm p-4">No conversations yet</p>}
            {threads.map(t => {
              const other = getOther(t);
              return (
                <button key={t._id} onClick={() => setActive(t)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-white/5 transition-colors ${active?._id === t._id ? 'bg-primary-900/20' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {other?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{other?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.content}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation */}
        {active ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-purple-700 flex items-center justify-center text-xs font-bold">
                {getOther(active)?.name?.[0]?.toUpperCase()}
              </div>
              <span className="font-semibold text-white">{getOther(active)?.name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map(m => {
                const isMe = m.sender._id === user._id || m.sender === user._id;
                return (
                  <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-dark-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}>
                      {m.content}
                      <p className="text-xs opacity-50 mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                placeholder="Type a message…" className="input flex-1" />
              <button onClick={send} disabled={sending||!text.trim()} className="btn-primary px-4">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Select a conversation</p></div>
          </div>
        )}
      </main>
    </div>
  );
}
