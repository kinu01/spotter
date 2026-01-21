import { SadFaceIcon, PlaneIcon, SearchIcon } from './Icons'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon || <SadFaceIcon size="xl" className="w-16 h-16 text-gray-300 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      )}
    </div>
  )
}

export function NoFlightsFound() {
  return (
    <EmptyState
      title="No flights found"
      description="Try adjusting your search criteria or selecting different dates."
      icon={<PlaneIcon size="xl" className="w-16 h-16 text-gray-300 mb-4" />}
    />
  )
}

export function SearchPrompt() {
  return (
    <EmptyState
      title="Search for flights"
      description="Enter your origin, destination, and travel dates to find available flights."
      icon={<SearchIcon size="xl" className="w-16 h-16 text-gray-300 mb-4" />}
    />
  )
}
