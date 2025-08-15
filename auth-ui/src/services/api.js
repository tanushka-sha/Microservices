const API_BASE_URL = 'http://localhost:8000'

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  // Merge headers safely so Content-Type is not lost when spreading options
  const mergedHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  const fetchOptions = {
    ...options,
    headers: mergedHeaders,
  }

  const response = await fetch(url, fetchOptions)

  const data = await response.json()

  if (!response.ok) {
    // Better error handling for different response formats
    let errorMessage = 'Something went wrong'
    
    console.log('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
      detailType: typeof data.detail,
      detailIsArray: Array.isArray(data.detail),
      detailLength: Array.isArray(data.detail) ? data.detail.length : 'N/A',
      detailContent: data.detail
    })
    
    if (data.detail) {
      // Handle different types of detail
      if (Array.isArray(data.detail)) {
        // Validation errors array
        errorMessage = data.detail.map(err => {
          if (err.loc && err.msg) {
            return `${err.loc.join('.')}: ${err.msg}`
          } else if (err.msg) {
            return err.msg
          } else {
            return JSON.stringify(err)
          }
        }).join(', ')
      } else if (typeof data.detail === 'object') {
        errorMessage = JSON.stringify(data.detail)
      } else {
        errorMessage = data.detail
      }
    } else if (data.message) {
      errorMessage = data.message
    } else if (typeof data === 'string') {
      errorMessage = data
    } else if (data.error) {
      errorMessage = data.error
    } else if (response.status === 422) {
      errorMessage = 'Invalid request data. Please check your input.'
    } else if (response.status === 401) {
      errorMessage = 'Authentication required. Please log in again.'
    } else if (response.status === 403) {
      errorMessage = 'Access denied. You do not have permission for this action.'
    } else if (response.status === 404) {
      errorMessage = 'Resource not found.'
    } else if (response.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    }
    
    throw new Error(errorMessage)
  }

  return data
}

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      }),
    })
  },

  // Login user
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })
  },

  // Get current user info (requires token)
  getCurrentUser: async (token) => {
    return apiRequest('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// Search API functions
export const searchAPI = {
  // Perform web search (Tavily via backend)
  search: async (query, token) => {
    return apiRequest('/search/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
  },
}

// Image generation API functions
export const imageAPI = {
  // Generate image from prompt
  generateImage: async (prompt, token) => {
    const requestBody = {
      prompt: prompt,
    }
    
    console.log('Sending image generation request:', {
      url: `${API_BASE_URL}/image/generate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? '[HIDDEN]' : 'No token'}`
      },
      body: requestBody,
      bodyStringified: JSON.stringify(requestBody)
    })
    
    const response = await fetch(`${API_BASE_URL}/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      // Better error handling for different response formats
      let errorMessage = 'Something went wrong'
      
      console.log('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        detailType: typeof data.detail,
        detailIsArray: Array.isArray(data.detail),
        detailLength: Array.isArray(data.detail) ? data.detail.length : 'N/A',
        detailContent: data.detail
      })
      
      if (data.detail) {
        // Handle different types of detail
        if (Array.isArray(data.detail)) {
          // Validation errors array
          errorMessage = data.detail.map(err => {
            if (err.loc && err.msg) {
              return `${err.loc.join('.')}: ${err.msg}`
            } else if (err.msg) {
              return err.msg
            } else {
              return JSON.stringify(err)
            }
          }).join(', ')
        } else if (typeof data.detail === 'object') {
          errorMessage = JSON.stringify(data.detail)
        } else {
          errorMessage = data.detail
        }
      } else if (data.message) {
        errorMessage = data.message
      } else if (typeof data === 'string') {
        errorMessage = data
      } else if (data.error) {
        errorMessage = data.error
      } else if (response.status === 422) {
        errorMessage = 'Invalid request data. Please check your input.'
      } else if (response.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (response.status === 403) {
        errorMessage = 'Access denied. You do not have permission for this action.'
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.'
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      }
      
      throw new Error(errorMessage)
    }

    return data
  },
}

// Dashboard API functions
export const dashboardAPI = {
  // Get user history
  getHistory: async (token, filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.date) queryParams.append('date', filters.date)
    if (filters.type) queryParams.append('type', filters.type)
    if (filters.search) queryParams.append('search', filters.search)
    
    const url = `/dashboard/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    return apiRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Get dashboard stats
  getStats: async (token) => {
    return apiRequest('/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Get specific history item
  getHistoryItem: async (token, itemId) => {
    return apiRequest(`/dashboard/history/${itemId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Update history item
  updateHistoryItem: async (token, itemId, updateData) => {
    return apiRequest(`/dashboard/history/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
  },

  // Delete history item
  deleteHistoryItem: async (token, itemId) => {
    return apiRequest(`/dashboard/history/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // Bulk delete history items
  bulkDeleteHistory: async (token, itemIds) => {
    return apiRequest('/dashboard/history/bulk', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ item_ids: itemIds }),
    })
  },
}

// Token management
export const tokenManager = {
  // Store token in localStorage
  setToken: (token) => {
    localStorage.setItem('authToken', token)
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('authToken')
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('authToken')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  },
}
