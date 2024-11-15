import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    content: '',
    tags: '',
  });

  useEffect(() => {
    loadPrompts();
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">🤖 Prompt Storage</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Prompt
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {prompt.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(prompt.content)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {prompt.content}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prompt.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
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
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Create New Prompt
              </Dialog.Title>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                      className="block text-sm font-medium text-gray-700"
                    >
                      Content
                    </label>
                    <textarea
                      id="content"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
  );
}

export default App;
