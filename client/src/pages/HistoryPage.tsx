import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { getHistory, getHistoryItem } from '../services/item.service';
import type { Item } from '../types/item';
import { getCategoryConfig } from '../types/categories';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { formatDistanceToNow } from '../utils/dateUtils';
import { ReportModal } from '../features/report/ReportModal';
import { useNavigate } from 'react-router-dom';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'lost' | 'found' | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingItem, setReportingItem] = useState<Item | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [search, category, type, page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory({
        search: search || undefined,
        category: category || undefined,
        type: type || undefined,
        page,
        limit: 20,
        sortBy: 'resolvedAt',
        sortOrder: 'desc',
      });
      setItems(response.items);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (itemId: string) => {
    try {
      const item = await getHistoryItem(itemId);
      setSelectedItem(item);
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  const handleReport = (item: Item) => {
    setReportingItem(item);
    setShowReportModal(true);
  };

  const categories = [
    'wallet', 'phone', 'keys', 'pet-dog', 'pet-cat', 'bag', 'backpack',
    'documents', 'watch', 'glasses', 'headphones', 'camera', 'book', 'card', 'jewelry', 'other'
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button 
                onClick={() => navigate('/')} 
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Resolved Items History</h1>
                <p className="text-xs text-gray-500 font-light">
                    Browse successfully returned items
                </p>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="glass-panel chamfered-box p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
             
             <div className="relative">
                 <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                    }}
                    className="w-full h-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:bg-white/10 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                 >
                    <option value="" className="bg-gray-900">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-900">
                        {getCategoryConfig(cat).label}
                        </option>
                    ))}
                 </select>
            </div>

            <div className="relative">
                 <select
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value as 'lost' | 'found' | '');
                        setPage(1);
                    }}
                    className="w-full h-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:bg-white/10 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                 >
                    <option value="" className="bg-gray-900">All Types</option>
                    <option value="lost" className="bg-gray-900">Lost</option>
                    <option value="found" className="bg-gray-900">Found</option>
                 </select>
            </div>

            <Button
              onClick={() => {
                setSearch('');
                setCategory('');
                setType('');
                setPage(1);
              }}
              variant="outline"
              className="w-full"
            >
              <Filter size={18} className="mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        { loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center border-dashed border border-white/10">
            <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No resolved items found</h3>
            <p className="text-gray-500 font-light">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-left">
              {items.map((item) => {
                const categoryConfig = getCategoryConfig(item.category);
                const Icon = categoryConfig.icon;
                return (
                  <div
                    key={item._id}
                    className="glass-panel group rounded-xl overflow-hidden hover:bg-white/5 transition-all cursor-pointer border border-white/5 hover:border-cyan-500/30"
                    onClick={() => handleItemClick(item._id)}
                  >
                    {item.imageUrl && (
                         <div className="relative h-48 overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-3 left-4 z-20">
                                <span
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        item.type === 'found'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}
                                >
                                    {item.type === 'found' ? 'Found' : 'Lost'}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="p-5">
                       {!item.imageUrl && (
                           <div className="flex items-center gap-3 mb-4">
                               <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                   <Icon size={24} style={{ color: categoryConfig.color }} />
                               </div>
                               <div>
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            item.type === 'found'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}
                                    >
                                        {item.type === 'found' ? 'Found' : 'Lost'}
                                    </span>
                               </div>
                           </div>
                       )}

                      <div className="mb-4">
                            <h3 className="font-bold text-white text-lg truncate mb-1 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{categoryConfig.label}</p>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-light leading-relaxed border-l-2 border-white/10 pl-3">{item.description}</p>
                      )}
                      
                      <div className="space-y-2 text-xs text-gray-500 mb-5 bg-black/20 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-cyan-600" />
                          <span>Owner: <span className="text-gray-300">{item.owner.name}</span></span>
                        </div>
                        {item.claimer && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span>Claimed by: <span className="text-gray-300">{item.claimer.name}</span></span>
                          </div>
                        )}
                        {item.resolvedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-blue-500" />
                            <span>Resolved {formatDistanceToNow(new Date(item.resolvedAt))}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReport(item);
                        }}
                        variant="outline"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300"
                      >
                        <AlertCircle size={16} className="mr-2" />
                        Report Issue
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            { totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  className="bg-black/20"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-400 font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  className="bg-black/20"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        { selectedItem && (
          <Modal open={!!selectedItem} onClose={() => setSelectedItem(null)}>
            <div className="max-w-2xl w-full">
              <div className="flex items-start gap-4 mb-6">
                {selectedItem.imageUrl && (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-32 h-32 object-cover rounded-lg border border-white/10"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-white/10 text-gray-300 border border-white/10">
                      {getCategoryConfig(selectedItem.category).label}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                        selectedItem.type === 'found'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {selectedItem.type === 'found' ? 'Found' : 'Lost'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.description && (
                <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
                  <h3 className="font-bold text-gray-300 mb-2 text-sm uppercase">Description</h3>
                  <p className="text-gray-400 leading-relaxed font-light">{selectedItem.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase">Posted By</h4>
                  <p className="font-bold text-white text-lg">{selectedItem.owner.name}</p>
                  {selectedItem.owner.email && (
                    <p className="text-xs text-gray-400">{selectedItem.owner.email}</p>
                  )}
                </div>
                {selectedItem.claimer && (
                  <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                    <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase">Claimed By</h4>
                    <p className="font-bold text-white text-lg">{selectedItem.claimer.name}</p>
                    {selectedItem.claimer.email && (
                      <p className="text-xs text-gray-400">{selectedItem.claimer.email}</p>
                    )}
                  </div>
                )}
                {selectedItem.resolvedAt && (
                  <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                    <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase">Resolved</h4>
                    <p className="font-bold text-white text-lg">
                      {formatDistanceToNow(new Date(selectedItem.resolvedAt))}
                    </p>
                    {selectedItem.resolvedBy && (
                      <p className="text-xs text-gray-400">by {selectedItem.resolvedBy.name}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setReportingItem(selectedItem);
                    setShowReportModal(true);
                    setSelectedItem(null);
                  }}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                >
                  <AlertCircle size={18} className="mr-2" />
                  Report Issue
                </Button>
                <Button onClick={() => setSelectedItem(null)} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        { reportingItem && (
          <ReportModal
            item={reportingItem}
            open={showReportModal}
            onClose={() => {
              setShowReportModal(false);
              setReportingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
