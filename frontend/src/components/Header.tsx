import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="bg-brand dark:bg-brand-dark">
      <div className="mx-auto flex max-w-[1126px] items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-semibold text-white">Skånetrafiken Delays</h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
