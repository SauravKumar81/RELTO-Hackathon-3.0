import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../features/map/MapView';
import { PostItemModal } from '../features/post-item/PostItemModal';
import { ItemsSidebar } from '../components/layout/ItemsSidebar';
import { useAuthStore } from '../store/auth.store';
import { useMapStore } from '../store/map.store';
import { useChatStore } from '../store/chat.store';
import { Button } from '../components/ui/Button';
import { UserStatsBadge } from '../components/feedback/UserStatsBadge';
import { ConversationsList } from '../features/chat/ConversationsList';
import { ChatSheet } from '../features/chat/ChatSheet';
import { LogOut, Search, MessageCircle, Sun, Moon, Sunrise, Sunset, Menu, X, List, History as HistoryIcon, Pin, PinOff, ChevronLeft, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const MapPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const lightPreset = useMapStore((s) => s.lightPreset);
  const setLightPreset = useMapStore((s) => s.setLightPreset);
  const mapStyle = useMapStore((s) => s.mapStyle);
  const toggleMapStyle = useMapStore((s) => s.toggleMapStyle);
  const selectedItemId = useMapStore((s) => s.selectedItemId);
  const unreadCount = useChatStore((s) => s.unreadCount);
  const fetchUnreadCount = useChatStore((s) => s.fetchUnreadCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (!isMobile && isPinned) {
      setSidebarOpen(true);
    }
  }, [isPinned]);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchUnreadCount]);

  useEffect(() => {
    if (selectedItemId && !isMobile) {
      setSidebarOpen(true);
    }
  }, [selectedItemId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const lightPresets = [
    { id: 'dawn', icon: Sunrise, label: 'Dawn' },
    { id: 'day', icon: Sun, label: 'Day' },
    { id: 'dusk', icon: Sunset, label: 'Dusk' },
    { id: 'night', icon: Moon, label: 'Night' },
  ] as const;

  return (
    <div className="relative h-screen w-full bg-[#050505] overflow-hidden font-sans selection:bg-cyan-500/30">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      <header className="hidden md:flex absolute top-4 left-4 right-4 z-20 justify-between items-start pointer-events-none">
        <div className="flex items-center gap-3">
             <div className="pointer-events-auto flex items-center gap-3 glass-panel chamfered-box  p-2 pr-4 bg-black/40 backdrop-blur-xl border-white/10">
               <img src="/favicon.png" alt="Relto Logo" className="h-8 w-8 object-contain rounded-lg" />
               <span className="text-xl font-bold tracking-tight text-cyan-400">RELTO</span>
             </div>
             
             <AnimatePresence>
               {!isSidebarOpen && (
                 <motion.button
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   onClick={() => setSidebarOpen(true)}
                   className="pointer-events-auto flex items-center gap-2 glass-panel chamfered-box p-2.5 bg-black/40 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all group cursor-pointer"
                 >
                   <List size={18} className="text-gray-300 group-hover:text-white transition-colors" />
                   <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Items</span>
                 </motion.button>
               )}
             </AnimatePresence>
        </div>

        <div className="pointer-events-auto flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="glass-panel chamfered-box p-1 flex items-center w-80 relative group focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                <Search size={18} className="text-gray-400 ml-3 shrink-0 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search nearby items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-sm h-10 px-3 outline-none"
                />
              </div>

            <div className="glass-panel chamfered-box p-1.5 flex items-center gap-1">
                 <button onClick={() => navigate('/history')} className="p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium flex items-center gap-2">
                    <HistoryIcon size={18} />
                    <span className="text-sm">History</span>
                 </button>
                 
                 <div className="w-px h-6 bg-white/10" />
                 
                 <button
                   onClick={toggleMapStyle}
                   className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${mapStyle === 'satellite' ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                   title={mapStyle === 'satellite' ? 'Switch to Standard' : 'Switch to Satellite'}
                   aria-label={mapStyle === 'satellite' ? 'Switch to Standard Map' : 'Switch to Satellite Map'}
                 >
                   <Globe size={16} />
                   <span className="text-sm">{mapStyle === 'satellite' ? 'Sat' : 'Map'}</span>
                 </button>
                 
                 <div className="w-px h-6 bg-white/10" />
                 
                 {token ? (
                    <div className="flex items-center gap-2 pl-1">
                      <button 
                        onClick={() => setShowMessages(true)}
                        className="relative p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all group"
                      >
                        <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                        {unreadCount > 0 && (
                          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                          </span>
                        )}
                      </button>
                      
                      <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                        {user && <UserStatsBadge user={user} onClick={() => navigate('/profile')} />}
                        <button
                          onClick={handleLogout}
                          className="p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                          title="Logout"
                        >
                          <LogOut size={18} />
                        </button>
                      </div>
                    </div>
                 ) : (
                    <div className="flex items-center gap-2 px-1">
                      <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                      <Button onClick={() => navigate('/register')}>Sign Up</Button>
                    </div>
                 )}
            </div>
        </div>
      </header>

      <header className="md:hidden absolute left-0 right-0 top-0 z-50 glass-panel border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Relto Logo" className="h-8 w-8 object-contain rounded-lg shadow-lg" />
            <span className="text-lg font-bold tracking-tight text-cyan-400">RELTO</span>
          </div>
          
          <div className="flex items-center gap-2">
             <button
                 onClick={() => setSidebarOpen(!isSidebarOpen)}
                 className="p-2 text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
             >
                 {isSidebarOpen ? <X size={22} /> : <List size={22} />}
             </button>
             <button
               onClick={() => setShowMobileMenu(!showMobileMenu)}
               className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
             >
               {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#050505]/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="p-4 space-y-4">
                 {token && (
                   <div className="glass-panel chamfered-box p-3 flex items-center gap-3">
                      <Search size={18} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-white focus:ring-0 text-sm w-full outline-none"
                      />
                   </div>
                 )}
                 
                  {token ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { navigate('/history'); setShowMobileMenu(false); }}>
                            <HistoryIcon size={18} /> History
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setShowMessages(true); setShowMobileMenu(false); }}>
                                <MessageCircle size={18} /> Messages
                            </Button>
                            <Button variant="ghost" className={`w-full justify-start gap-2 ${mapStyle === 'satellite' ? 'text-emerald-400 bg-emerald-500/10' : ''}`} onClick={() => { toggleMapStyle(); setShowMobileMenu(false); }}>
                                <Globe size={18} /> {mapStyle === 'satellite' ? 'Standard Map' : 'Satellite Map'}
                            </Button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                {user && <UserStatsBadge user={user} onClick={() => navigate('/profile')} />}
                                <button onClick={handleLogout} className="text-red-400 p-2"><LogOut size={20} /></button>
                            </div>
                        </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                       <Button variant="ghost" onClick={() => { navigate('/login'); setShowMobileMenu(false); }}>Login</Button>
                       <Button onClick={() => { navigate('/register'); setShowMobileMenu(false); }}>Sign Up</Button>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="absolute left-0 top-0 bottom-0 z-40 pointer-events-none">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full pointer-events-auto overflow-visible"
            >
              <ItemsSidebar 
                searchQuery={searchQuery} 
                isMobile={isMobile}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isSidebarOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.2 }}
              className="absolute left-[22rem] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 pointer-events-auto"
            >
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-2 rounded-lg backdrop-blur-md border shadow-lg transition-all ${isPinned 
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' 
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80 hover:border-white/30'}`}
                title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
              >
                {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
              </button>
              
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setIsPinned(false);
                }}
                className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 shadow-lg transition-all"
                title="Close Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 right-6 z-40">
        <div className="glass-panel chamfered-box p-1.5 flex flex-col gap-2 pointer-events-auto">
            {lightPresets.map((p) => {
                const Icon = p.icon;
                const isActive = lightPreset === p.id;
                return (
                <button
                    key={p.id}
                    onClick={() => setLightPreset(p.id)}
                    className={`p-2.5 rounded-lg transition-all ${isActive ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    title={p.label}
                >
                    <Icon size={18} />
                </button>
                );
            })}
        </div>
      </div>

      {token && (
        <div className="absolute bottom-60 right-6 z-40 pointer-events-auto">
          <PostItemModal />
        </div>
      )}

      <ConversationsList 
        open={showMessages} 
        onClose={() => setShowMessages(false)} 
      />

      <ChatSheet
        open={!!useChatStore((s) => s.activeConversation)}
        conversation={useChatStore((s) => s.activeConversation)}
        onClose={() => useChatStore.getState().clearActiveConversation()}
      />
    </div>
  );
};
