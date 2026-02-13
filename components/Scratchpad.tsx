'use client';

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getAuthToken } from '../services/authService'
import { Plus, Pin, Trash2, Edit2, Save, X, StickyNote, Loader2 } from 'lucide-react'

interface Note {
  id: string
  model_id: string
  title: string | null
  content: string
  element_id: string | null
  note_type: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

interface ScratchpadProps {
  modelId: string
  isOpen: boolean
  onClose: () => void
}

export function Scratchpad({ modelId, isOpen, onClose }: ScratchpadProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen && modelId) {
      fetchNotes()
    }
  }, [isOpen, modelId])

  const fetchNotes = async () => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`/api/models/${modelId}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNoteContent.trim()) return

    const token = getAuthToken()
    if (!token) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/models/${modelId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newNoteTitle || null,
          content: newNoteContent,
          noteType: 'general'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([data.note, ...notes])
        setNewNoteContent('')
        setNewNoteTitle('')
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const data = await response.json()
        setNotes(notes.map(n => n.id === noteId ? data.note : n))
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const togglePin = (noteId: string, currentPinned: boolean) => {
    updateNote(noteId, { isPinned: !currentPinned })
  }

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = async (noteId: string) => {
    await updateNote(noteId, { content: editContent })
    setEditingNoteId(null)
    setEditContent('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Scratchpad</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Add new note */}
      <div className="p-4 border-b border-border space-y-2">
        <Input
          placeholder="Note title (optional)"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          className="bg-background"
        />
        <textarea
          placeholder="Write your note here..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="w-full h-20 p-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          size="sm"
          onClick={addNote}
          disabled={!newNoteContent.trim() || isSaving}
          className="w-full"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Note
        </Button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No notes yet. Add your first note above.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-lg border ${
                note.is_pinned ? 'border-primary/50 bg-primary/5' : 'border-border bg-background'
              }`}
            >
              {note.title && (
                <h3 className="font-medium text-sm text-foreground mb-1">{note.title}</h3>
              )}
              
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-20 p-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(note.id)}>
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(note.id, note.is_pinned)}
                        className={note.is_pinned ? 'text-primary' : ''}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
