import { PlaneIcon } from './Icons'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <PlaneIcon size="lg" className="text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Spotter</h1>
        </div>
      </div>
    </header>
  )
}
