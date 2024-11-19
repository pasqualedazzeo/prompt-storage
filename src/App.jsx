import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadPrompts();
    // Apply dark mode class on initial load
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update dark mode when the state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const loadPrompts = async () => {
    try {
      const response = await fetch('/prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      toast.error('Failed to load prompts');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    try {
      const response = await fetch(`/prompts/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPrompt.title,
          content: newPrompt.content,
          tags: newPrompt.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save prompt');
      }

      await response.json(); // Consume the response but don't store it
      toast.success('Prompt saved successfully!');
      setIsModalOpen(false);
      setNewPrompt({ title: '', content: '', tags: '' });
      await loadPrompts();  // Reload all prompts
    } catch (error) {
      toast.error(error.message || 'Failed to save prompt');
    }
  };

  const handleDelete = async (promptId) => {
    try {
      await fetch(`/prompts/${promptId}`, { method: 'DELETE' });
      toast.success('Prompt deleted successfully!');
      loadPrompts();
    } catch (error) {
      toast.error('Failed to delete prompt');
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prompt Storage</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-gray-900"
            >
              <PlusIcon className="h-5 w-5" />
              New Prompt
            </button>
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {prompt.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(prompt.content)}
                        className="text-gray-400 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="text-gray-400 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {prompt.content}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {prompt.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Prompt Modal */}
        <Transition show={isModalOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={() => setIsModalOpen(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Create New Prompt
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                        value={newPrompt.title}
                        onChange={(e) =>
                          setNewPrompt({ ...newPrompt, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Content
                      </label>
                      <textarea
                        id="content"
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                        value={newPrompt.content}
                        onChange={(e) =>
                          setNewPrompt({ ...newPrompt, content: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-white sm:text-sm"
                        value={newPrompt.tags}
                        onChange={(e) =>
                          setNewPrompt({ ...newPrompt, tags: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-900"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-900"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}

export default App;
