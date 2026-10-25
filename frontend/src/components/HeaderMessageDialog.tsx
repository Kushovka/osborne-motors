import { useEffect, useRef } from 'react'
import { FaTimes } from 'react-icons/fa'
import { LeadForm } from './LeadForm'

type HeaderMessageDialogProps = {
  open: boolean
  onClose: () => void
}

export const HeaderMessageDialog = ({ open, onClose }: HeaderMessageDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="vehicle-quote-dialog header-message-dialog"
      aria-labelledby="header-message-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="vehicle-quote-dialog__header">
        <div className="min-w-0">
          <h2 id="header-message-dialog-title">Send Us a Message</h2>
        </div>
        <button type="button" className="vehicle-quote-dialog__close" aria-label="Close message form" onClick={onClose}>
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div className="vehicle-quote-dialog__body">
        <p className="vehicle-quote-dialog__intro">Have a question? Tell us how we can help, and our team will get back to you.</p>
        <LeadForm
          title="Send Message"
          variant="vehicle-inline"
          className="header-message-form"
          phonePlaceholder="(402) 379-0445"
          messagePlaceholder="How can we help you?"
        />
      </div>
    </dialog>
  )
}
