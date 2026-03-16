import { Search } from 'lucide-react';
import { Input } from '@/view/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent } from '@/view/components/ui/card';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface DataFiltersProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
}

export const DataFilters = ({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  filters,
}: DataFiltersProps) => {
  return (
    <Card className="border-0 shadow-card mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                {filter.label}
              </label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

