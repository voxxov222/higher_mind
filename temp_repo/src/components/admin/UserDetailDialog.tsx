'use client'

import { Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { UserDetail } from '@/actions/admin'
import { formatRelativeTime } from '@/components/admin/utils/format'

interface UserDetailDialogProps {
  user: UserDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditPlan: (user: UserDetail) => void
}

export function UserDetailDialog({ user, open, onOpenChange, onEditPlan }: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription className="text-slate-400">Detailed information about the selected user</DialogDescription>
        </DialogHeader>
        {user && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Username</p>
                <p className="text-white">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white">{user.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="text-white">
                  {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Auth Provider</p>
                <p className="text-white capitalize">{user.authProvider}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Subscription Plan</p>
                <div className="flex items-center gap-2">
                  <p className="text-white capitalize">{user.subscriptionPlan}</p>
                  <Button size="sm" variant="ghost" onClick={() => onEditPlan(user)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">AI Generations (Today)</p>
                <p className="text-white">{user.todayAIUsage}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">AI Generations (Total)</p>
                <p className="text-white">{user.aiGenerationsTotal}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">PDF Exports (Total)</p>
                <p className="text-white">{user.pdfExportsTotal}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Subjects</p>
                <p className="text-white">{user.subjectsCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Saved Charts</p>
                <p className="text-white">{user.savedChartsCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Last Login</p>
                <p className="text-white">
                  {user.lastLoginAt ? formatRelativeTime(new Date(user.lastLoginAt)) : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Login Count</p>
                <p className="text-white">{user.loginCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Last Active</p>
                <p className="text-white">
                  {user.lastActiveAt ? formatRelativeTime(new Date(user.lastActiveAt)) : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-white">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
