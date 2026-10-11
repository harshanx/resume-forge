import { supabase } from './firebase'

export async function getAuthHeaders() {
  console.log('Getting Supabase session...')
  const { data: { session }, error } = await supabase.auth.getSession()
  
  console.log('Session data:', session ? 'Session found' : 'No session')
  if (error) {
    console.error('Session error:', error)
    throw new Error(`Auth error: ${error.message}`)
  }
  
  if (!session) {
    console.error('No active session')
    throw new Error('No active session - please login first')
  }
  
  console.log('Session access_token found')
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

export async function apiCall(url: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders()
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  
  return response.json()
}
