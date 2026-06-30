'use client'

import { Search, Columns } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { VisibleColumns } from '@/hooks/useUsersTable'

interface UserTableFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  planFilter: string
  onPlanFilterChange: (value: string) => void
  visibleColumns: VisibleColumns
  onToggleColumn: (column: keyof VisibleColumns) => void
}

export function UserTableFilters({
  search,
  onSearchChange,
  onSearchSubmit,
  planFilter,
  onPlanFilterChange,
  visibleColumns,
  onToggleColumn,
}: UserTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={onSearchSubmit} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Select value={planFilter || 'all'} onValueChange={(v) => onPlanFilterChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
          <SelectValue placeholder="All Plans" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plans</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="trial">Trial</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="lifetime">Lifetime</SelectItem>
        </SelectContent>
      </Select>

      {/* Column Visibility Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
            <Columns className="h-4 w-4 mr-2" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(visibleColumns).map(([key, visible]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onToggleColumn(key as keyof VisibleColumns)}
              className="flex items-center justify-between"
            >
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              {visible && <span className="text-green-400">&#10003;</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
