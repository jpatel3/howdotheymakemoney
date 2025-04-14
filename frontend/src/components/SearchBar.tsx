import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search for a company...',
  initialValue = '',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = React.useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex w-full max-w-3xl ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-12 rounded-r-none h-12 text-lg"
      />
      <Button 
        type="submit" 
        className="rounded-l-none h-12 bg-neon-green text-black hover:bg-neon-green/90"
      >
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
}
