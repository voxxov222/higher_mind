'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserPaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function UserPagination({ page, pageSize, total, totalPages, onPageChange }: UserPaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
      <p className="text-sm text-slate-400">
        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} users
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="border-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-slate-400">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="border-slate-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
