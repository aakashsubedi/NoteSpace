import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, Moon, Sun, LogOut, Edit3, Trash2, Save, X, Tag, ChevronLeft } from 'lucide-react';
import { noteService } from '../api/noteService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Note } from '../types/Note';
import { useToast } from '../contexts/ToastContext';

const Notes: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [viewMode, setViewMode] = useState<'list' | 'note'>('list');
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    loadNotes();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setViewMode('list');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.getAllNotes();
      setNotes(data);
      // Extract unique tags from all notes
      const tags = new Set<string>();
      data.forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => tags.add(tag));
        }
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      showToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      showToast('Please enter both title and content', 'error');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to create notes', 'error');
      return;
    }

    try {
      console.log('Creating note with data:', { title: newNote.title, content: newNote.content });
      const createdNote = await noteService.createNote({
        title: newNote.title,
        content: newNote.content
      });
      console.log('Note created successfully:', createdNote);
      setNotes(prevNotes => [createdNote, ...prevNotes]);
      setNewNote({ title: '', content: '' });
      setViewMode('list');
      showToast('Note created successfully!', 'success');
    } catch (error: any) {
      console.error('Error creating note:', error);
      // Show more specific error message
      const errorMessage = error.message || 'Failed to create note';
      showToast(errorMessage, 'error');
    }
  };

  const handleUpdateNote = async (id: number, title: string, content: string) => {
    try {
      const updatedNote = await noteService.updateNote(id, { title, content });
      setNotes(prevNotes =>
        prevNotes.map(note => (note.id === id ? updatedNote : note))
      );
      showToast('Note updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update note', 'error');
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await noteService.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
      showToast('Note deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete note', 'error');
    }
  };

  const handleEditNote = (note: Partial<Note>) => {
    setEditingNote({
      ...note,
      id: note.id || 0, // Ensure id is a number
      title: note.title || '',
      content: note.content || '',
      tags: note.tags || [],
      created_at: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at || new Date().toISOString()
    });
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (!editingNote.title?.trim() || !editingNote.content?.trim()) {
      showToast('Please enter both title and content', 'error');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to save notes', 'error');
      return;
    }

    try {
      if (selectedNote) {
        console.log('Updating note:', { id: selectedNote.id, title: editingNote.title, content: editingNote.content });
        await handleUpdateNote(selectedNote.id, editingNote.title, editingNote.content);
      } else {
        console.log('Creating new note:', { title: editingNote.title, content: editingNote.content });
        setNewNote({
          title: editingNote.title,
          content: editingNote.content
        });
        await handleCreateNote();
      }
      setIsEditing(false);
      setEditingNote({});
    } catch (error: any) {
      console.error('Error saving note:', error);
      const errorMessage = error.message || 'Failed to save note';
      showToast(errorMessage, 'error');
    }
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

  // Filter notes based on search term and tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || (note.tags && note.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {/* Mobile Header */}
      {windowWidth <= 768 && (
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
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
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
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </header>
      )}

      {/* Search Bar - Mobile */}
      {windowWidth <= 768 && showSearch && viewMode === 'list' && (
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {windowWidth > 768 && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/logo.png" 
                    alt="NoteSpace Logo" 
                    className="h-10 w-10 rounded-xl"
                  />
                  <span className="font-semibold text-gray-900 dark:text-white">NoteSpace</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setViewMode('note');
                  setEditingNote({
                    id: 0,
                    title: '',
                    content: '',
                    tags: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>New Note</span>
              </button>
            </div>

            {/* Desktop Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm || filterTag ? 'No matching notes found' : 'No notes yet'}
                </div>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setViewMode('note');
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-colors mb-2 ${
                      selectedNote?.id === note.id
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {note.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          {viewMode === 'list' && windowWidth <= 768 ? (
            <div className="p-2">
              {/* Create New Note Button - Mobile */}
              <button
                onClick={() => {
                  setViewMode('note');
                  setEditingNote({
                    id: 0,
                    title: '',
                    content: '',
                    tags: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                }}
                className="w-full mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>New Note</span>
              </button>

              {/* Mobile Notes List */}
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm || filterTag ? 'No matching notes found' : 'No notes yet'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setSelectedNote(note);
                        setViewMode('note');
                      }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {note.title}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(note.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full bg-white dark:bg-gray-800">
              {selectedNote && !isEditing ? (
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedNote.title}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(selectedNote);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(selectedNote.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="prose dark:prose-invert flex-1 overflow-y-auto">
                    {selectedNote.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Last updated {formatDate(selectedNote.updated_at)}
                  </div>
                </div>
              ) : (
                <div className="p-4 h-full flex flex-col">
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Title"
                      value={editingNote.title || ''}
                      onChange={(e) => handleEditNote({ ...editingNote, title: e.target.value })}
                      className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Start writing your note here..."
                    value={editingNote.content || ''}
                    onChange={(e) => handleEditNote({ ...editingNote, content: e.target.value })}
                    className="flex-1 w-full bg-transparent border-none focus:outline-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <X className="h-5 w-5" />
                      <span>Cancel</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {selectedNote && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(selectedNote.id);
                          }}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={handleSaveNote}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-5 w-5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;