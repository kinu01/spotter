import { PlaneIcon } from './Icons'

export function WelcomeHero() {
  return (
    <div className="mt-12 text-center">
      <PlaneIcon size="xl" className="mx-auto h-24 w-24 text-gray-300" />
      <h2 className="mt-4 text-xl font-medium text-gray-900">
        Find your next flight
      </h2>
      <p className="mt-2 text-gray-500">
        Enter your origin, destination, and travel dates to search for available flights.
      </p>
    </div>
  )
}
