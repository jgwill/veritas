"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type DigitalElement } from "@/lib/types"

interface EditElementDialogProps {
  isOpen: boolean
  onClose: () => void
  element: DigitalElement | null
  onSave: (updatedElement: DigitalElement) => void
}

export default function EditElementDialog({ isOpen, onClose, element, onSave }: EditElementDialogProps) {
  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (element) {
      setDisplayName(element.displayName)
      setDescription(element.description || "")
    }
  }, [element])

  const handleSave = () => {
    if (element) {
      onSave({
        ...element,
        displayName,
        description,
      })
      onClose()
    }
  }

  if (!element) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Element</DialogTitle>
          <DialogDescription>Make changes to your element here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
