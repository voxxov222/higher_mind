'use client'

import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface UserEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newPlan: string
  onPlanChange: (plan: string) => void
  onSave: () => void
  isLoading: boolean
}

export function UserEditDialog({ open, onOpenChange, newPlan, onPlanChange, onSave, isLoading }: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription className="text-slate-400">Change the subscription plan for this user</DialogDescription>
        </DialogHeader>
        <Select value={newPlan} onValueChange={onPlanChange}>
          <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
