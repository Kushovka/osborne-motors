import { useEffect, useRef } from 'react'
import { FaTimes } from 'react-icons/fa'
import { LeadForm } from './LeadForm'

type HeaderMessageDialogProps = {
  open: boolean
  onClose: () => void
  titleId?: string
}

export const HeaderMessageDialog = ({ open, onClose, titleId = 'header-message-dialog-title' }: HeaderMessageDialogProps) => {
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
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="vehicle-quote-dialog__header">
        <div className="min-w-0">
          <h2 id={titleId}>Send Us a Message</h2>
        </div>
        <button type="button" className="vehicle-quote-dialog__close" aria-label="Close message form" onClick={onClose}>
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div className="vehicle-quote-dialog__body">
        <p className="vehicle-quote-dialog__intro">Have a question? Tell us how we can help, and our team will get back to you.</p>
        <LeadForm
          title="Send Message"
          className="vehicle-inquiry-form"
          namePlaceholder="Enter your full name"
          phonePlaceholder="Enter your phone number"
          emailPlaceholder="Enter your email address"
          messagePlaceholder="Tell us how we can help..."
          notice="No financing available."
          noticeLabel="Financing"
          actionAside={<p className="vehicle-inquiry__consent">By submitting this form, you agree to be contacted by Osborne Motors.</p>}
        />
      </div>
    </dialog>
  )
}
