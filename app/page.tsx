'use client'

import dynamic from 'next/dynamic'

// Dynamically import App to ensure it only runs on the client
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      <span className="ml-4 text-lg text-gray-500 dark:text-gray-400">Loading...</span>
    </div>
  ),
})

export default function Page() {
  return <App />
}
