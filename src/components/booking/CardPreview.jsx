const CardPreview = ({ cardNumber, cardName, expiryMonth, expiryYear }) => {
  const displayNumber = cardNumber || '•••• •••• •••• ••••'
  const displayName = cardName || 'Full Name'
  const displayExpiry = `${expiryMonth || 'MM'}/${expiryYear ? expiryYear.slice(-2) : 'YY'}`

  return (
    <div className="card-preview">
      <div className="card-preview__chip" />
      <div className="card-preview__number">{displayNumber}</div>
      <div className="card-preview__footer">
        <div>
          <div className="card-preview__label">CARDHOLDER</div>
          <div className="card-preview__value">{displayName}</div>
        </div>
        <div>
          <div className="card-preview__label">EXPIRES</div>
          <div className="card-preview__value">{displayExpiry}</div>
        </div>
      </div>
    </div>
  )
}

export default CardPreview
