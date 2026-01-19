import Image from 'next/image'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logos/javari/javari-logo-128.png"
                alt="Javari"
                width={128}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </Link>
          </div>
          
          <nav className="flex items-center space-x-8">
            <Link 
              href="/platform" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Platform
            </Link>
            <Link 
              href="/docs" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Docs
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
