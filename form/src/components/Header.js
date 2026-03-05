
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Preamar
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
