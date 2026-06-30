'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAIInterpretation } from '@/stores/aiInterpretationSettings'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AIContextDebugDialog } from '@/components/AIContextDebugDialog'
import { clientLogger } from '@/lib/logging/client'

import { useAIUsage } from '@/hooks/useAIUsage'
import { useQueryClient } from '@tanstack/react-query'
import { useWakeLock } from '@/hooks/useWakeLock'
import { getInterpretation, saveInterpretationChunk, deleteInterpretation } from '@/lib/cache/interpretations'

import { AIGenerationSection } from '@/components/notes-panel/AIGenerationSection'
import { NotesViewer } from '@/components/notes-panel/NotesViewer'
import { NotesEditor } from '@/components/notes-panel/NotesEditor'

/** Result from AI generation including debug context */
export interface AIGenerationResult {
  text: string
  debugContext?: string
  debugUserPrompt?: string
}

interface NotesPanelProps {
  savedChartId?: string
  initialNotes?: string
  notes?: string
  onNotesChange?: (notes: string) => void
  onGenerateAI?: (
    onStreamUpdate?: (text: string) => void,
    signal?: AbortSignal,
    relationshipType?: string,
  ) => Promise<AIGenerationResult>
  /** If true, shows a warning that chart data has changed since AI was generated */
  isDataStale?: boolean
  /** Label describing what the stale notes were generated for (e.g., "Dec 15, 2024" or "2025") */
  staleDataLabel?: string
  showRelationshipSelector?: boolean
  /** Unique identifier for caching interpretation in IndexedDB */
  chartId?: string
}

export function NotesPanel({
  savedChartId,
  initialNotes = '',
  notes: propNotes,
  onNotesChange,
  onGenerateAI,
  isDataStale = false,
  staleDataLabel,
  showRelationshipSelector = false,
  chartId,
}: NotesPanelProps) {
  const [localNotes, setLocalNotes] = useState(initialNotes)
  const notes = propNotes !== undefined ? propNotes : localNotes
  const abortControllerRef = useRef<AbortController | null>(null)

  const { data: usageData } = useAIUsage()
  const queryClient = useQueryClient()
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock()
  const isRestoredRef = useRef(false)

  const handleNotesChange = useCallback(
    (newNotes: string) => {
      setLocalNotes(newNotes)
      onNotesChange?.(newNotes)
    },
    [onNotesChange],
  )

  // Auto-restore from IndexedDB on mount
  useEffect(() => {
    if (!chartId || isRestoredRef.current) return

    const restoreFromCache = async () => {
      try {
        const cached = await getInterpretation(chartId)
        if (cached && cached.content) {
          handleNotesChange(cached.content)
          isRestoredRef.current = true
          setIsFromCache(true) // Mark as restored from local cache
          setIsCacheAlertDismissed(false)
          clientLogger.debug('Restored interpretation from cache for:', chartId)
        }
      } catch (error) {
        clientLogger.error('Failed to restore interpretation from cache:', error)
      }
    }

    restoreFromCache()
  }, [chartId, handleNotesChange])

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('view')
  const { selectedSchool } = useAIInterpretation()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [isWarningDismissed, setIsWarningDismissed] = useState(false)
  const [relationshipType, setRelationshipType] = useState('generic')
  // Track if notes are only in local cache (not saved to DB)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isCacheAlertDismissed, setIsCacheAlertDismissed] = useState(false)
  // Debug context viewer
  const [debugContext, setDebugContext] = useState<string | null>(null)
  const [debugUserPrompt, setDebugUserPrompt] = useState<string | null>(null)

  const handleSave = async () => {
    if (!savedChartId) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/saved-charts/${savedChartId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) throw new Error('Failed to save notes')
      onNotesChange?.(notes)
      setIsFromCache(false) // Notes are now saved to DB
      // Clear from IndexedDB cache since it's now in the database
      if (chartId) {
        await deleteInterpretation(chartId)
      }
      toast.success('Notes saved successfully')
    } catch (error) {
      clientLogger.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateAI = async () => {
    if (!onGenerateAI) return

    setIsGenerating(true)
    setActiveTab('view')
    setIsWarningDismissed(false) // Reset warning state for fresh generation

    // Request wake lock to prevent screen sleep during generation
    await requestWakeLock()

    // Optimistic update
    const previousUsage = queryClient.getQueryData<{ usage: number; remaining: number }>(['ai-usage'])
    if (previousUsage) {
      queryClient.setQueryData(['ai-usage'], {
        ...previousUsage,
        usage: previousUsage.usage + 1,
        remaining: Math.max(0, previousUsage.remaining - 1),
      })
    }

    try {
      const controller = new AbortController()
      abortControllerRef.current = controller

      // Wrap the stream callback to also save to IndexedDB progressively
      const handleStreamUpdate = (text: string) => {
        handleNotesChange(text)
        // Save progressively to IndexedDB (non-blocking)
        if (chartId) {
          saveInterpretationChunk(chartId, text, false).catch(() => {})
        }
      }

      const result = await onGenerateAI(handleStreamUpdate, controller.signal, relationshipType)
      handleNotesChange(result.text)

      // Store debug context for viewing
      if (result.debugContext) setDebugContext(result.debugContext)
      if (result.debugUserPrompt) setDebugUserPrompt(result.debugUserPrompt)

      // Mark interpretation as complete in IndexedDB
      if (chartId) {
        await saveInterpretationChunk(chartId, result.text, true)
      }

      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
    } catch (error) {
      // Revert on error if needed, but invalidation in finally will handle it usually.
      // Explicitly invalidating here to be sure if error occurs we sync back.
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })

      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('Generation stopped')
        // Keep partial content in cache for abort case
      } else {
        clientLogger.error('Error generating notes:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate notes'
        toast.error(errorMessage)
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
      // Release wake lock
      await releaseWakeLock()
      // Ensure we sync with server reality (e.g. if user stopped and it wasn't counted)
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
    }
  }

  const handleDeleteNotes = async () => {
    handleNotesChange('')
    setShowDeleteDialog(false)
    // Delete from IndexedDB cache
    if (chartId) {
      await deleteInterpretation(chartId)
    }
    toast.success('Notes deleted')
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {(!notes || isGenerating) && (
        <AIGenerationSection
          selectedSchool={selectedSchool}
          usageData={usageData}
          isGenerating={isGenerating}
          showRelationshipSelector={showRelationshipSelector}
          relationshipType={relationshipType}
          onRelationshipTypeChange={setRelationshipType}
          onGenerate={handleGenerateAI}
          onStop={handleStop}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="view"
              className="data-[state=active]:bg-card data-[state=active]:shadow-md dark:data-[state=active]:border dark:data-[state=active]:bg-background"
            >
              View
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              disabled={isGenerating}
              className="data-[state=active]:bg-card data-[state=active]:shadow-md dark:data-[state=active]:border dark:data-[state=active]:bg-background"
            >
              Edit
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center">
            {/* Debug info button - shows AI context */}
            <AIContextDebugDialog debugContext={debugContext} debugUserPrompt={debugUserPrompt} />
            {notes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="ml-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="view" className="mt-4">
          <NotesViewer
            notes={notes}
            isDataStale={isDataStale}
            staleDataLabel={staleDataLabel}
            isWarningDismissed={isWarningDismissed}
            onWarningDismiss={() => setIsWarningDismissed(true)}
            isFromCache={isFromCache}
            isCacheAlertDismissed={isCacheAlertDismissed}
            onCacheAlertDismiss={() => setIsCacheAlertDismissed(true)}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <NotesEditor
            notes={notes}
            onNotesChange={handleNotesChange}
            showSaveButton={!!savedChartId}
            isSaving={isSaving}
            onSave={handleSave}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotes}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
