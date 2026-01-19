import { Header } from '@/components/header'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Your Story. Our Design.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Welcome to the Javari Platform
          </p>
        </div>
      </div>
    </main>
  )
}
