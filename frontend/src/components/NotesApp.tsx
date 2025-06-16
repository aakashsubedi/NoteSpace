import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, Moon, Sun, LogOut, Edit3, Trash2, Save, X, Tag, Calendar, Filter, Key, User, Mail, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../types/Note';
import { useAuth } from '../context/AuthContext';
import { fetchNotes, createNote, updateNote, deleteNote } from '../services/noteService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Notes from './Notes';

const NotesApp: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showSearch, setShowSearch] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'note'>('list');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadNotes();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user, navigate]);

  const isMobile = windowWidth <= 768;

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data);
      setError(null);
      // Extract unique tags from all notes
      const tags = new Set<string>();
      data.forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
    } catch (err) {
      setError('Failed to load notes');
      showToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (title: string, content: string) => {
    try {
      const newNote = await createNote({ title, content });
      setNotes(prevNotes => [...prevNotes, newNote]);
      showToast('Note created successfully', 'success');
    } catch (err) {
      showToast('Failed to create note', 'error');
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      const updatedNote = await updateNote(id, { title, content });
      setNotes(prevNotes =>
        prevNotes.map(note => (note.id === id ? updatedNote : note))
      );
      showToast('Note updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update note', 'error');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      showToast('Note deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete note', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSelectNote = (note: Note | null) => {
    setSelectedNote(note);
  };

  const handleEditNote = (note: Partial<Note>) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (selectedNote) {
      handleUpdateNote(selectedNote.id, editingNote.title || '', editingNote.content || '');
    } else {
      handleCreateNote(editingNote.title || '', editingNote.content || '');
    }
    setIsEditing(false);
    setEditingNote({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote({});
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password change API call
      showToast('Password changed successfully', 'success');
      setShowChangePassword(false);
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
        {viewMode === 'note' ? (
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedNote(null);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="NoteSpace Logo" 
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-semibold text-gray-900 dark:text-white">NoteSpace</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {viewMode === 'list' && (
            <>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setShowTags(!showTags)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Tag className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </>
          )}
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Search Bar - Mobile */}
      {showSearch && viewMode === 'list' && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Tags Filter - Mobile */}
      {showTags && viewMode === 'list' && allTags.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterTag === tag
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <Notes
            notes={notes}
            loading={loading}
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onSelectNote={handleSelectNote}
            onEditNote={handleEditNote}
            onSaveNote={handleSaveNote}
            onCancelEdit={handleCancelEdit}
            onFormatDate={formatDate}
            onViewMode={setViewMode}
            onSelectedNote={selectedNote}
            onIsEditing={isEditing}
            onEditingNote={editingNote}
            onSearchTerm={searchTerm}
            onSetSearchTerm={setSearchTerm}
            onFilterTag={filterTag}
            onShowSearch={showSearch}
            onSetShowSearch={setShowSearch}
            onShowTags={showTags}
            onAllTags={allTags}
          />
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Username</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{user?.username}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Email</span>
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{user?.email}</span>
              </div>
              
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowChangePassword(true);
                }}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Key className="h-5 w-5" />
                <span>Change Password</span>
              </button>
              
              <button
                onClick={logout}
                className="w-full p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-4 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesApp;