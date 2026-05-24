import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'

const PayPalMockCheckout = ({ bookingId, amount, onSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const orderResponse = await api.post('/payments/create-order', { bookingId })
      const { orderId } = orderResponse.data.data

      const captureResponse = await api.post('/payments/capture-order', {
        orderId,
        cardNumber: cardNumber.replace(/\s/g, '')
      })

      return captureResponse.data.data
    },
    onSuccess: (data) => {
      toast.success('Payment successful!')
      onSuccess(data)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Payment failed')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!cardNumber || !expiry || !cvv || !cardName) {
      toast.error('Please fill in all payment fields')
      return
    }

    paymentMutation.mutate()
  }

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <CreditCardIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">PayPal Checkout (Mock)</h3>
          <p className="text-sm text-gray-500">Simulated payment — no real charges</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount due</span>
          <span className="text-2xl font-bold text-primary-600">${amount}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name on card</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="input"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="input font-mono"
            placeholder="4111 1111 1111 1111"
            maxLength={19}
          />
          <p className="text-xs text-gray-400 mt-1">
            Test: 4111 1111 1111 1111 (success) · 4000 0000 0000 0002 (decline)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="input"
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="input"
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={paymentMutation.isPending}
            className="flex-1 btn-primary py-3 disabled:opacity-50"
          >
            {paymentMutation.isPending ? 'Processing...' : `Pay $${amount}`}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={paymentMutation.isPending}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <ShieldCheckIcon className="h-4 w-4 mr-1" />
        Mock payment for development only
      </div>
    </div>
  )
}

export default PayPalMockCheckout
