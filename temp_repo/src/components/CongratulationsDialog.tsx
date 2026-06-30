'use client'

/**
 * Congratulations Dialog
 *
 * Shows a celebration message when user successfully upgrades to pro.
 * Includes confetti animation and list of unlocked features.
 */
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, Zap, Star, Trophy } from 'lucide-react'

interface CongratulationsDialogProps {
  open: boolean
  onClose: () => void
}

export function CongratulationsDialog({ open, onClose }: CongratulationsDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <>
      {/* Confetti effect */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-sm">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Congratulations!</DialogTitle>
            <DialogDescription className="text-center text-base">
              Your Pro subscription is now active! You have unlocked all premium features.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Sparkles className="h-5 w-5 text-primary" />
                Unlocked Features
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Unlimited subjects in your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-sm">All types of astrological charts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Advanced AI interpretations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Professional PDF export</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-yellow-700 dark:text-yellow-400">
              <Zap className="h-5 w-5" />
              <p className="text-sm font-medium">Your Pro features are available immediately!</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} className="flex-1" size="lg">
              <Star className="mr-2 h-5 w-5" />
              Start Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear forwards;
          border-radius: 2px;
        }
      `}</style>
    </>
  )
}
