import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import CardPreview from '../booking/CardPreview'
import { calculateBookingTotal, formatMoney, PLATFORM_FEE_PERCENT } from '../../utils/platformFee'

const Spinner = ({ size = 16 }) => (
  <svg
    className="animate-spin"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const DECLINE_CARD = '4000000000000002'

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SB'

const PayPalMockCheckout = ({
  bookingId,
  amount,
  sessionAmount,
  platformFee,
  onSuccess,
  onCancel,
  tutorName = 'Study Session',
  sessionDate = '',
  subject = 'Tutoring Session',
}) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [declineError, setDeclineError] = useState(false)
  const [formatError, setFormatError] = useState(false)
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const orderResponse = await api.post('/payments/create-order', { bookingId })
      const { orderId } = orderResponse.data.data

      const captureResponse = await api.post('/payments/capture-order', {
        orderId,
        cardNumber: cardNumber.replace(/\s/g, ''),
      })

      return captureResponse.data.data
    },
    onSuccess: (data) => {
      setDeclineError(false)
      toast.success('Payment successful!')
      onSuccess(data)
    },
    onError: (error) => {
      setDeclineError(true)
      toast.error(error.response?.data?.message || 'Payment failed')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!cardNumber || !expiry || !cvv || !cardName) {
      toast.error('Please fill in all payment fields')
      return
    }

    const stripped = cardNumber.replace(/\s/g, '')
    const isValidFormat = /^\d{16}$/.test(stripped)

    if (!isValidFormat) {
      setFormatError(true)
      setDeclineError(false)
      return
    }

    if (stripped === DECLINE_CARD) {
      setDeclineError(true)
      setFormatError(false)
      return
    }

    setDeclineError(false)
    setFormatError(false)
    paymentMutation.mutate()
  }

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const syncExpiry = (month, year) => {
    if (month && year) {
      setExpiry(`${month}/${year.slice(-2)}`)
    } else {
      setExpiry('')
    }
  }

  const handleMonthChange = (month) => {
    setExpiryMonth(month)
    syncExpiry(month, expiryYear)
  }

  const handleYearChange = (year) => {
    setExpiryYear(year)
    syncExpiry(expiryMonth, year)
  }

  const pricing = sessionAmount != null
    ? {
        sessionAmount: Number(sessionAmount),
        platformFee: platformFee != null
          ? Number(platformFee)
          : calculateBookingTotal(sessionAmount).platformFee,
        totalAmount: amount != null
          ? Number(amount)
          : calculateBookingTotal(sessionAmount).totalAmount,
      }
    : calculateBookingTotal(Number(amount))

  const formattedSubtotal = formatMoney(pricing.sessionAmount)
  const formattedPlatformFee = formatMoney(pricing.platformFee)
  const formattedTotal = formatMoney(pricing.totalAmount)

  const cardDigits = cardNumber.replace(/\s/g, '')
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const years = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i))

  const sessionLabel = sessionDate
    ? new Date(sessionDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Scheduled session'

  const inputClass = (valid, error = false) => {
    if (error) return 'field-input field-input--error'
    if (valid) return 'field-input field-input--valid'
    return 'field-input'
  }

  return (
    <div className="checkout-page">
      <form onSubmit={handleSubmit}>
        <div className="checkout-layout">
          {/* Left — Payment form */}
          <div className="payment-card">
            <h2 className="section-title">Payment Method</h2>

            <div className="tab tab--active">
              <CreditCardIcon className="h-5 w-5" />
              <span>Credit / Debit Card</span>
              <span className="tab-check">✓</span>
            </div>

            <CardPreview
              cardNumber={cardNumber}
              cardName={cardName}
              expiryMonth={expiryMonth}
              expiryYear={expiryYear}
            />

            <div className="field-group">
              <label className="field-label" htmlFor="cardName">
                Name on Card
              </label>
              <input
                id="cardName"
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={inputClass(cardName.trim().length > 2)}
                placeholder="As shown on the card"
                autoComplete="cc-name"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="cardNumber">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(formatCardNumber(e.target.value))
                  setFormatError(false)
                  setDeclineError(false)
                }}
                className={inputClass(cardDigits.length === 16, declineError || formatError)}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                autoComplete="cc-number"
              />
              {formatError && (
                <p className="field-error-msg">
                  Please enter a valid 16-digit card number
                </p>
              )}
              {declineError && (
                <p className="field-error-msg">
                  Your card was declined. Please try a different card.
                </p>
              )}
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="expiryMonth">
                  Expiration Date
                </label>
                <select
                  id="expiryMonth"
                  value={expiryMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className={`field-select ${expiryMonth ? 'field-input--valid' : ''}`}
                >
                  <option value="">Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="expiryYear">
                  &nbsp;
                </label>
                <select
                  id="expiryYear"
                  value={expiryYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className={`field-select ${expiryYear ? 'field-input--valid' : ''}`}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="cvv">
                  CVC <span title="3-digit code on the back of your card">ⓘ</span>
                </label>
                <div className="cvv-wrap">
                  <input
                    id="cvv"
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className={inputClass(cvv.length >= 3)}
                    placeholder="CVV"
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                  <span className="cvv-tooltip" title="3-digit code on the back of your card">
                    ?
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div className="order-card">
            <h2 className="section-title">Order Summary</h2>

            <div className="session-block">
              <div className="session-avatar">{getInitials(tutorName)}</div>
              <div>
                <div className="session-name">{tutorName}</div>
                <div className="session-meta">
                  <span className="badge--subject">{subject}</span>
                  <span>·</span>
                  <span>Tutoring Session</span>
                  <span>·</span>
                  <span>{sessionLabel}</span>
                </div>
              </div>
            </div>

            <div className="price-row">
              <span>Subtotal</span>
              <span>${formattedSubtotal}</span>
            </div>
            <div className="price-row">
              <span>Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
              <span>${formattedPlatformFee}</span>
            </div>
            <div className="price-row">
              <span>Tax</span>
              <span className="price-free">$0.00</span>
            </div>
            <div className="price-row price-row--total">
              <span className="price-label">Total</span>
              <span className="price-value">${formattedTotal}</span>
            </div>

            <button
              type="submit"
              disabled={paymentMutation.isPending}
              className="btn-place-order"
            >
              {paymentMutation.isPending ? (
                <>
                  <Spinner size={16} />
                  Processing...
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-4 w-4" />
                  Place Order — ${formattedTotal}
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={paymentMutation.isPending}
                className="back-link"
              >
                Back to sessions
              </button>
            )}
          </div>
        </div>

        <p className="test-hint">
          Any valid 16-digit card number will succeed ·{' '}
          <code>4000 0000 0000 0002</code> to test decline
        </p>
      </form>
    </div>
  )
}

export default PayPalMockCheckout
