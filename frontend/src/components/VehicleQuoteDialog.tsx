import { useEffect, useRef } from 'react'
import { FaTimes } from 'react-icons/fa'
import { LeadForm } from './LeadForm'

type VehicleQuoteDialogProps = {
  open: boolean
  onClose: () => void
  vehicleId: string
  vehicleName: string
  vehicleValue: number
}

export const VehicleQuoteDialog = ({ open, onClose, vehicleId, vehicleName, vehicleValue }: VehicleQuoteDialogProps) => {
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
      className="vehicle-quote-dialog"
      aria-labelledby="vehicle-quote-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="vehicle-quote-dialog__header">
        <div className="min-w-0">
          <h2 id="vehicle-quote-dialog-title">Have Questions About This Vehicle?</h2>
          <p title={vehicleName}>{vehicleName}</p>
        </div>
        <button type="button" className="vehicle-quote-dialog__close" aria-label="Close quote form" onClick={onClose}>
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div className="vehicle-quote-dialog__body">
        <p className="vehicle-quote-dialog__intro">We’re here to help. Get in touch and we’ll be happy to answer any questions you have.</p>
        <LeadForm
          title="Send Message"
          vehicleId={vehicleId}
          vehicleName={vehicleName}
          vehicleValue={vehicleValue}
          variant="vehicle-inline"
          className="vehicle-inquiry-form"
          phonePlaceholder="(402) 379-0445"
          messagePlaceholder="Ask about this vehicle..."
        />
      </div>
    </dialog>
  )
}
