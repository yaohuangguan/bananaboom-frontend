import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { featureService } from '../../services/featureService';
import { Todo, User, BarkConfig } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { toast } from '../Toast';
import { TodoModal } from './TodoModal';
import { WishList } from './TodoWishList';
import { RoutineList } from './TodoRoutineList';

type ViewType = 'wish' | 'routine';
type TabType = 'todo' | 'in_progress' | 'done';

interface TodoWidgetProps {
  user?: User | null;
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({ user }) => {
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<ViewType>('wish');
  const [activeTab, setActiveTab] = useState<TabType>('todo');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<
    Partial<Todo> & { bark?: BarkConfig & { call?: string } }
  >({
    todo: '',
    description: '',
    status: 'todo',
    images: [],
    targetDate: '',
    type: 'wish',
    recurrence: '',
    remindAt: '',
    notifyUsers: [],
    bark: { sound: '', level: 'active', icon: '', url: '', image: '', call: '0' }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Widget Expansion State
  const [isExpanded, setIsExpanded] = useState(false);

  // Users for notification
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Refresh Trigger
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      const fetchAvailableUsers = async () => {
        try {
          const { data } = await apiService.getUsers(1, 100);
          setAvailableUsers(data);
        } catch (e) {
          console.error('Failed to load users for notification', e);
        }
      };
      fetchAvailableUsers();
    }
  }, [user]);

  const handleOpenAdd = () => {
    setCurrentTodo({
      todo: '',
      description: '',
      status: activeTab,
      images: [],
      targetDate: '',
      type: viewType,
      recurrence: '',
      remindAt: viewType === 'routine' ? new Date().toISOString() : '',
      notifyUsers: user ? [user._id] : [],
      bark: { sound: '', level: 'active', icon: '', url: '', image: '', call: '0' }
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setCurrentTodo({
      ...todo,
      bark: todo.bark || { sound: '', level: 'active', icon: '', url: '', image: '', call: '0' },
      notifyUsers: todo.notifyUsers
        ? Array.isArray(todo.notifyUsers) && typeof todo.notifyUsers[0] === 'object'
          ? (todo.notifyUsers as User[]).map((u) => u._id)
          : (todo.notifyUsers as string[])
        : []
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentTodo.todo?.trim()) return;
    setIsProcessing(true);
    try {
      const notifyPayload = currentTodo.notifyUsers || (user ? [user._id] : []);
      if (isEditing && currentTodo._id) {
        await apiService.updateTodo(currentTodo._id, {
          ...currentTodo,
          notifyUsers: notifyPayload as string[]
        });
      } else {
        await featureService.addTodo(
          currentTodo.todo!,
          currentTodo.description,
          currentTodo.targetDate,
          currentTodo.images,
          currentTodo.type,
          currentTodo.recurrence,
          currentTodo.remindAt,
          { notifyUsers: notifyPayload as string[], bark: currentTodo.bark }
        );
      }
      setIsModalOpen(false);
      setRefreshKey((prev) => prev + 1); // Trigger list refresh
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!currentTodo._id) return;
    setIsProcessing(true);
    try {
      await apiService.deleteTodo(currentTodo._id);
      setIsModalOpen(false);
      toast.success('Wish deleted');
      setRefreshKey((prev) => prev + 1);
    } catch (e) {
      toast.error('Failed to delete');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestRoutine = async () => {
    if (!currentTodo._id) return;
    setIsTesting(true);
    try {
      await featureService.testRoutine(currentTodo._id);
      toast.success('Test notification triggered!');
    } catch (e) {
      toast.error('Trigger failed.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      className={`bg-pink-50/80 rounded-3xl shadow-lg border border-pink-200 transition-all duration-500 relative flex flex-col ${isExpanded ? 'h-[600px]' : 'h-16'} overflow-hidden group`}
    >
      {/* Header Bar */}
      <div
        className="h-16 px-5 flex items-center justify-center sm:justify-between bg-white/50 backdrop-blur-sm border-b border-pink-100 cursor-pointer shrink-0 z-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md">
            <i className={`fas ${viewType === 'wish' ? 'fa-list-ul' : 'fa-clipboard-list'}`}></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-none">
              {viewType === 'wish'
                ? t.privateSpace.bucketList.title
                : t.privateSpace.bucketList.types.routine}
            </h3>
            <p className="text-[10px] text-pink-500 font-mono uppercase tracking-widest mt-1">
              {viewType === 'wish'
                ? t.privateSpace.bucketList.subtitle
                : t.privateSpace.bucketList.subtitleRoutine}
            </p>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-100 transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 min-h-0 bg-white/30 relative transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* View Switcher */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex bg-white/60 p-1 rounded-xl shadow-sm border border-pink-100/50">
            <button
              onClick={() => setViewType('wish')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${viewType === 'wish' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-pink-500'}`}
            >
              {t.privateSpace.bucketList.types.wish}
            </button>
            <button
              onClick={() => setViewType('routine')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${viewType === 'routine' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-pink-500'}`}
            >
              {t.privateSpace.bucketList.types.routine}
            </button>
          </div>
        </div>

        {/* Content Lists */}
        <div className="flex-1 min-h-0 relative">
          {viewType === 'wish' ? (
            <WishList
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onEdit={handleOpenEdit}
              refreshKey={refreshKey}
            />
          ) : (
            <RoutineList onEdit={handleOpenEdit} refreshKey={refreshKey} />
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleOpenAdd}
          className="absolute bottom-6 right-6 w-12 h-12 bg-rose-500 text-white rounded-full shadow-xl hover:bg-rose-600 hover:scale-110 transition-all flex items-center justify-center z-20"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        todo={currentTodo}
        setTodo={setCurrentTodo}
        onSave={handleSave}
        isProcessing={isProcessing}
        isTesting={isTesting}
        onTest={handleTestRoutine}
        onDelete={isEditing ? handleDelete : undefined}
        isEditing={isEditing}
        user={user}
        availableUsers={availableUsers}
      />
    </div>
  );
};
