export const PLATFORM_FEE_RATE = 0.1
export const PLATFORM_FEE_PERCENT = 10

export const roundMoney = (value) => Math.round(Number(value) * 100) / 100

export const calculateBookingTotal = (sessionAmount) => {
  const subtotal = roundMoney(sessionAmount)
  const platformFee = roundMoney(subtotal * PLATFORM_FEE_RATE)
  const totalAmount = roundMoney(subtotal + platformFee)

  return { sessionAmount: subtotal, platformFee, totalAmount }
}

export const formatMoney = (value) => roundMoney(value).toFixed(2)
