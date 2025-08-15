import { useState, useEffect, useRef } from 'react'
import { tokenManager, dashboardAPI, imageAPI } from '../services/api'

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

const SearchHistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
)

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
)

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
)

const DiamondIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3.5 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

export default function Dashboard({ userName, onLogout, onBackToWelcome }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [apiError, setApiError] = useState(false)
  
  const filterRef = useRef(null)

  // Mock data for fallback
  const mockHistory = [
    {
      id: 1,
      type: 'search',
      prompt: 'What are the best hiking trails near Yosemite?',
      date: new Date().toISOString(),
      result_title: 'Yosemite Hiking Trails',
      result_summary: 'Top hiking trails in Yosemite National Park...'
    },
    {
      id: 2,
      type: 'image',
      prompt: 'Generate an image of a serene mountain landscape at sunset.',
      date: new Date().toISOString(),
      result_title: 'Mountain Landscape',
      result_summary: 'AI-generated mountain landscape image...'
    },
    {
      id: 3,
      type: 'search',
      prompt: 'Top-rated Italian restaurants in downtown San Francisco',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      result_title: 'Italian Restaurants SF',
      result_summary: 'Best Italian restaurants in San Francisco...'
    },
    {
      id: 4,
      type: 'image',
      prompt: 'Create a digital painting of a futuristic cityscape at night.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      result_title: 'Futuristic Cityscape',
      result_summary: 'Digital painting of a futuristic city...'
    },
    {
      id: 5,
      type: 'search',
      prompt: 'Latest news on renewable energy technologies',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      result_title: 'Renewable Energy News',
      result_summary: 'Latest developments in renewable energy...'
    }
  ]

  // Load history data from API
  const loadHistory = async () => {
    try {
      setLoading(true)
      setApiError(false)
      
      const token = tokenManager.getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      const filters = {}
      if (selectedDate) filters.date = selectedDate
      if (selectedType) filters.type = selectedType
      if (searchQuery) filters.search = searchQuery

      const response = await dashboardAPI.getHistory(token, filters)
      setHistory(response.items || response || [])
    } catch (error) {
      console.error('Failed to load history from API:', error)
      setApiError(true)
      // Fallback to mock data
      setHistory(mockHistory)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [selectedDate, selectedType, searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const groupHistoryByDate = (historyData) => {
    const groups = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    historyData.forEach(item => {
      // Handle different date formats
      let itemDate
      if (typeof item.date === 'string') {
        itemDate = new Date(item.date)
      } else if (item.date instanceof Date) {
        itemDate = item.date
      } else {
        itemDate = new Date()
      }

      // Check if date is valid
      if (isNaN(itemDate.getTime())) {
        itemDate = new Date()
      }

      let dateKey = ''

      if (itemDate.toDateString() === today.toDateString()) {
        dateKey = 'Today'
      } else if (itemDate.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday'
      } else {
        dateKey = itemDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })

    return groups
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || item.type === selectedType.toLowerCase()
    const matchesDate = !selectedDate || new Date(item.date).toDateString() === new Date(selectedDate).toDateString()
    
    return matchesSearch && matchesType && matchesDate
  })

  const groupedHistory = groupHistoryByDate(filteredHistory)

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setShowChat(true)
  }

  const handleDelete = async (itemId, e) => {
    e.stopPropagation()
    
    try {
      const token = tokenManager.getToken()
      if (token) {
        await dashboardAPI.deleteHistoryItem(token, itemId)
      }
      // Remove from local state
      setHistory(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Failed to delete item:', error)
      // Still remove from local state even if API fails
      setHistory(prev => prev.filter(item => item.id !== itemId))
    }
  }

  const handleEdit = (item, e) => {
    e.stopPropagation()
    setEditingItem(item)
  }

  const handleEditSave = async (newPrompt) => {
    try {
      const token = tokenManager.getToken()
      if (token && editingItem) {
        // Update the prompt in local state first
        setHistory(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, prompt: newPrompt }
            : item
        ))
        
        // For now, we'll just update locally since the backend doesn't support prompt updates
        // If you need to persist prompt changes, you'll need to add that field to the backend schema
        console.log('Prompt updated locally. Backend update skipped as prompt field is not supported.')
      } else {
        // Update local state even if no token
        setHistory(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, prompt: newPrompt }
            : item
        ))
      }
      
      setEditingItem(null)
    } catch (error) {
      console.error('Failed to update item:', error)
      // Still update local state even if API fails
      setHistory(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, prompt: newPrompt }
          : item
      ))
      setEditingItem(null)
    }
  }

  const handleEditCancel = () => {
    setEditingItem(null)
  }

  const formatTime = (date) => {
    let itemDate
    if (typeof date === 'string') {
      itemDate = new Date(date)
    } else if (date instanceof Date) {
      itemDate = date
    } else {
      itemDate = new Date()
    }

    if (isNaN(itemDate.getTime())) {
      return 'Invalid Date'
    }

    return itemDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (showChat && selectedItem) {
    return (
      <ChatView 
        item={selectedItem}
        onBack={() => {
          setShowChat(false)
          setSelectedItem(null)
        }}
        onDelete={async (itemId) => {
          try {
            const token = tokenManager.getToken()
            if (token) {
              await dashboardAPI.deleteHistoryItem(token, itemId)
            }
            setHistory(prev => prev.filter(item => item.id !== itemId))
          } catch (error) {
            console.error('Failed to delete item from chat view:', error)
            setHistory(prev => prev.filter(item => item.id !== itemId))
          }
          setShowChat(false)
          setSelectedItem(null)
        }}
        onEdit={handleEditSave}
      />
    )
  }

  return (
    <div className="min-h-screen w-[80%] bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {onBackToWelcome && (
                <button
                  onClick={onBackToWelcome}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                </button>
              )}
              <DiamondIcon className="text-gray-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Search History</h1>
              {apiError && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                  Offline Mode
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <SettingsIcon className="text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <UserIcon className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto"
              >
                <FilterIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 text-sm sm:text-base">Filter</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 sm:right-auto left-0 sm:left-auto mt-2 w-full sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="search">Search</option>
                        <option value="image">Image</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDate('')
                          setSelectedType('')
                        }}
                        className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading history...</p>
            </div>
          ) : Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No history found</p>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">{date}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                            {item.type === 'search' ? (
                              <SearchHistoryIcon className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingItem?.id === item.id ? (
                              <EditPrompt
                                prompt={item.prompt}
                                onSave={handleEditSave}
                                onCancel={handleEditCancel}
                              />
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-gray-900 break-words">
                                  {item.prompt}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTime(item.date)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.type === 'search' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.type === 'search' ? 'Search' : 'Image'}
                          </span>
                          
                          <button
                            onClick={(e) => handleEdit(item, e)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <EditIcon />
                          </button>
                          
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Edit Prompt Component
function EditPrompt({ prompt, onSave, onCancel }) {
  const [value, setValue] = useState(prompt)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Chat View Component
function ChatView({ item, onBack, onDelete, onEdit }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'user', content: item.prompt, timestamp: item.date },
    { id: 2, type: 'assistant', content: item.result_summary || 'AI-generated image from prompt', timestamp: new Date() }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: newMessage.trim(),
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
      setNewMessage('')
      setIsGenerating(true)

      try {
        const token = tokenManager.getToken()
        if (token) {
          const response = await imageAPI.generateImage(newMessage.trim(), token)
          
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: response.image_url || response.url || 'Image generated successfully',
            timestamp: new Date(),
            isImage: true
          }
          
          setMessages(prev => [...prev, assistantMessage])
        } else {
          // Fallback response if no token
          const assistantMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: 'AI-generated image from prompt',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } catch (error) {
        console.error('Failed to generate image:', error)
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: 'Sorry, I encountered an error generating the image. Please try again.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    let itemDate
    if (typeof date === 'string') {
      itemDate = new Date(date)
    } else if (date instanceof Date) {
      itemDate = date
    } else {
      itemDate = new Date()
    }

    if (isNaN(itemDate.getTime())) {
      return 'Invalid Date'
    }

    return itemDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="min-h-screen w-[60%] bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {item.type === 'search' ? 'Search Conversation' : 'Image Generation'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {(() => {
                    let itemDate
                    if (typeof item.date === 'string') {
                      itemDate = new Date(item.date)
                    } else if (item.date instanceof Date) {
                      itemDate = item.date
                    } else {
                      itemDate = new Date()
                    }
                    
                    if (isNaN(itemDate.getTime())) {
                      return 'Invalid Date'
                    }
                    
                    return itemDate.toLocaleDateString()
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onEdit(item.id, item.prompt)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white border border-gray-200 text-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm">Generating image...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={3}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isGenerating}
              className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
            >
              {isGenerating ? 'Generating...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
