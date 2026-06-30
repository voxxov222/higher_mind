'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Loader2,
  Eye,
  Trash2,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calculator,
  FileText,
  User,
  ArrowLeftRight,
  Layers,
  Sun,
  Moon,
  Clock,
  Crosshair,
} from 'lucide-react'

import { useUsersTable, type SortableColumn } from '@/hooks/useUsersTable'
import { UserTableFilters } from './UserTableFilters'
import { UserPagination } from './UserPagination'
import { UserDetailDialog } from './UserDetailDialog'
import { UserEditDialog } from './UserEditDialog'
import { UserDeleteDialog } from './UserDeleteDialog'
import { formatRelativeTime } from './utils/format'

interface SortableHeaderProps {
  column: SortableColumn
  children: React.ReactNode
  className?: string
  onSort: (column: SortableColumn) => void
  getSortState: (column: SortableColumn) => { isActive: boolean; order: 'asc' | 'desc' }
}

function SortableHeader({ column, children, className = '', onSort, getSortState }: SortableHeaderProps) {
  const { isActive, order } = getSortState(column)

  const renderSortIndicator = () => {
    if (!isActive) {
      return <ArrowUpDown className="h-3 w-3" />
    }
    return order === 'desc' ? (
      <ArrowDown className="h-3 w-3 text-blue-400" />
    ) : (
      <ArrowUp className="h-3 w-3 text-blue-400" />
    )
  }

  return (
    <TableHead
      className={`text-left px-4 py-3 text-sm font-medium text-slate-400 cursor-pointer hover:text-white select-none ${className}`}
      onClick={() => onSort(column)}
    >
      <span className="flex items-center gap-1">
        {children}
        {renderSortIndicator()}
      </span>
    </TableHead>
  )
}

export function UsersTable() {
  const {
    sortedUsers,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    setPage,
    search,
    setSearch,
    planFilter,
    setPlanFilter,
    handleSearch,
    clientSortBy,
    handleSort,
    getSortState,
    visibleColumns,
    toggleColumn,
    selectedUser,
    isDetailOpen,
    setIsDetailOpen,
    isEditOpen,
    setIsEditOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    userToDelete,
    newPlan,
    setNewPlan,
    isActionLoading,
    handleViewDetails,
    handleEditPlan,
    handleQuickEditPlan,
    handleSavePlan,
    handleDeleteUser,
    handleOpenDeleteDialog,
  } = useUsersTable()

  return (
    <div className="space-y-4">
      {/* Filters */}
      <UserTableFilters
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        planFilter={planFilter}
        onPlanFilterChange={(v) => {
          setPlanFilter(v)
          setPage(1)
        }}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
      />

      {/* Client-side sort notice */}
      {clientSortBy && (
        <p className="text-xs text-amber-400/80">
          Sorted by {clientSortBy} within current page only (client-side sorting)
        </p>
      )}

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-b-slate-700">
              <SortableHeader column="username" onSort={handleSort} getSortState={getSortState}>
                Username
              </SortableHeader>
              {visibleColumns.email && (
                <SortableHeader column="email" onSort={handleSort} getSortState={getSortState}>
                  Email
                </SortableHeader>
              )}
              {visibleColumns.plan && (
                <SortableHeader column="subscriptionPlan" onSort={handleSort} getSortState={getSortState}>
                  Plan
                </SortableHeader>
              )}
              {visibleColumns.created && (
                <SortableHeader column="createdAt" onSort={handleSort} getSortState={getSortState}>
                  Created
                </SortableHeader>
              )}
              {visibleColumns.lastLogin && (
                <SortableHeader column="lastLoginAt" onSort={handleSort} getSortState={getSortState}>
                  Last Login
                </SortableHeader>
              )}
              {visibleColumns.lastActive && (
                <SortableHeader column="lastActiveAt" onSort={handleSort} getSortState={getSortState}>
                  Last Active
                </SortableHeader>
              )}
              {visibleColumns.logins && (
                <SortableHeader column="loginCount" onSort={handleSort} getSortState={getSortState}>
                  Logins
                </SortableHeader>
              )}
              {visibleColumns.subjects && (
                <SortableHeader column="subjectsCount" onSort={handleSort} getSortState={getSortState}>
                  Subjects
                </SortableHeader>
              )}
              {visibleColumns.charts && (
                <SortableHeader column="savedChartsCount" onSort={handleSort} getSortState={getSortState}>
                  Charts
                </SortableHeader>
              )}
              {visibleColumns.calculations && (
                <SortableHeader column="calculationsTotal" onSort={handleSort} getSortState={getSortState}>
                  <Calculator className="h-3 w-3" />
                  Total
                </SortableHeader>
              )}
              {/* Chart type columns */}
              {visibleColumns.calcNatal && (
                <SortableHeader column="calc_natal" onSort={handleSort} getSortState={getSortState}>
                  <User className="h-3 w-3" />
                  Natal
                </SortableHeader>
              )}
              {visibleColumns.calcTransit && (
                <SortableHeader column="calc_transit" onSort={handleSort} getSortState={getSortState}>
                  <Crosshair className="h-3 w-3" />
                  Transit
                </SortableHeader>
              )}
              {visibleColumns.calcSynastry && (
                <SortableHeader column="calc_synastry" onSort={handleSort} getSortState={getSortState}>
                  <ArrowLeftRight className="h-3 w-3" />
                  Synastry
                </SortableHeader>
              )}
              {visibleColumns.calcComposite && (
                <SortableHeader column="calc_composite" onSort={handleSort} getSortState={getSortState}>
                  <Layers className="h-3 w-3" />
                  Composite
                </SortableHeader>
              )}
              {visibleColumns.calcSolarReturn && (
                <SortableHeader column="calc_solar-return" onSort={handleSort} getSortState={getSortState}>
                  <Sun className="h-3 w-3" />
                  Solar
                </SortableHeader>
              )}
              {visibleColumns.calcLunarReturn && (
                <SortableHeader column="calc_lunar-return" onSort={handleSort} getSortState={getSortState}>
                  <Moon className="h-3 w-3" />
                  Lunar
                </SortableHeader>
              )}
              {visibleColumns.calcTimeline && (
                <SortableHeader column="calc_timeline" onSort={handleSort} getSortState={getSortState}>
                  <Clock className="h-3 w-3" />
                  Timeline
                </SortableHeader>
              )}
              {visibleColumns.calcNow && (
                <SortableHeader column="calc_now" onSort={handleSort} getSortState={getSortState}>
                  <Crosshair className="h-3 w-3" />
                  Now
                </SortableHeader>
              )}
              {visibleColumns.aiGenerations && (
                <SortableHeader column="aiGenerationsTotal" onSort={handleSort} getSortState={getSortState}>
                  AI
                </SortableHeader>
              )}
              {visibleColumns.pdfExports && (
                <SortableHeader column="pdfExportsTotal" onSort={handleSort} getSortState={getSortState}>
                  <FileText className="h-3 w-3" />
                  PDF
                </SortableHeader>
              )}
              <TableHead className="text-right px-4 py-3 text-sm font-medium text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={21} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : sortedUsers.length === 0 ? (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={21} className="px-4 py-8 text-center text-slate-400">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-700/20 border-b-slate-700/50">
                  <TableCell className="px-4 py-3 text-sm text-white font-medium">{user.username}</TableCell>
                  {visibleColumns.email && (
                    <TableCell className="px-4 py-3 text-sm text-slate-300">{user.email || '-'}</TableCell>
                  )}
                  {visibleColumns.plan && (
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          user.subscriptionPlan === 'pro'
                            ? 'bg-purple-500/20 text-purple-400'
                            : user.subscriptionPlan === 'trial'
                              ? 'bg-blue-500/20 text-blue-400'
                              : user.subscriptionPlan === 'lifetime'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {user.subscriptionPlan}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.created && (
                    <TableCell className="px-4 py-3 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  )}
                  {visibleColumns.lastLogin && (
                    <TableCell className="px-4 py-3 text-sm text-slate-400">
                      {user.lastLoginAt ? formatRelativeTime(new Date(user.lastLoginAt)) : 'Never'}
                    </TableCell>
                  )}
                  {visibleColumns.lastActive && (
                    <TableCell className="px-4 py-3 text-sm text-slate-400">
                      {user.lastActiveAt ? formatRelativeTime(new Date(user.lastActiveAt)) : 'Never'}
                    </TableCell>
                  )}
                  {visibleColumns.logins && (
                    <TableCell className="px-4 py-3 text-sm text-slate-300">{user.loginCount}</TableCell>
                  )}
                  {visibleColumns.subjects && (
                    <TableCell className="px-4 py-3 text-sm text-slate-300">{user.subjectsCount}</TableCell>
                  )}
                  {visibleColumns.charts && (
                    <TableCell className="px-4 py-3 text-sm text-slate-300">{user.savedChartsCount}</TableCell>
                  )}
                  {visibleColumns.calculations && (
                    <TableCell className="px-4 py-3 text-sm text-purple-400 font-medium">
                      {user.calculationsTotal.toLocaleString()}
                    </TableCell>
                  )}
                  {/* Chart type cells */}
                  {visibleColumns.calcNatal && (
                    <TableCell className="px-4 py-3 text-sm text-blue-400">{user.calculationsByType.natal}</TableCell>
                  )}
                  {visibleColumns.calcTransit && (
                    <TableCell className="px-4 py-3 text-sm text-green-400">
                      {user.calculationsByType.transit}
                    </TableCell>
                  )}
                  {visibleColumns.calcSynastry && (
                    <TableCell className="px-4 py-3 text-sm text-pink-400">
                      {user.calculationsByType.synastry}
                    </TableCell>
                  )}
                  {visibleColumns.calcComposite && (
                    <TableCell className="px-4 py-3 text-sm text-purple-400">
                      {user.calculationsByType.composite}
                    </TableCell>
                  )}
                  {visibleColumns.calcSolarReturn && (
                    <TableCell className="px-4 py-3 text-sm text-yellow-400">
                      {user.calculationsByType['solar-return']}
                    </TableCell>
                  )}
                  {visibleColumns.calcLunarReturn && (
                    <TableCell className="px-4 py-3 text-sm text-slate-300">
                      {user.calculationsByType['lunar-return']}
                    </TableCell>
                  )}
                  {visibleColumns.calcTimeline && (
                    <TableCell className="px-4 py-3 text-sm text-cyan-400">
                      {user.calculationsByType.timeline}
                    </TableCell>
                  )}
                  {visibleColumns.calcNow && (
                    <TableCell className="px-4 py-3 text-sm text-orange-400">{user.calculationsByType.now}</TableCell>
                  )}
                  {visibleColumns.aiGenerations && (
                    <TableCell className="px-4 py-3 text-sm text-cyan-400">{user.aiGenerationsTotal}</TableCell>
                  )}
                  {visibleColumns.pdfExports && (
                    <TableCell className="px-4 py-3 text-sm text-emerald-400">{user.pdfExportsTotal}</TableCell>
                  )}
                  <TableCell className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQuickEditPlan(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteDialog(user)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <UserPagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* User Detail Dialog */}
      <UserDetailDialog
        user={selectedUser}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEditPlan={handleEditPlan}
      />

      {/* Edit Plan Dialog */}
      <UserEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        newPlan={newPlan}
        onPlanChange={setNewPlan}
        onSave={handleSavePlan}
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <UserDeleteDialog
        user={userToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteUser}
        isLoading={isActionLoading}
      />
    </div>
  )
}
