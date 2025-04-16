import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/about" className="text-gray-500 hover:text-gray-600">
            About
          </Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-600">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-600">
            Terms
          </Link>
        </div>
        <div className="mt-4 md:order-1 md:mt-0">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} How Do They Make Money. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 