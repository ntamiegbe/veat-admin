'use client'

import { useRouter } from 'next/navigation'

export default function Unauthorized() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center space-y-8 p-8">
                <h1 className="text-4xl font-bold text-red-600">Unauthorized Access</h1>
                <p className="text-gray-600">
                    You do not have permission to access this area.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Return to Home
                </button>
            </div>
        </div>
    )
}