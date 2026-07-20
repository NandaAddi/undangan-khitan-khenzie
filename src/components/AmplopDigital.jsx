import { useState } from 'react'

export default function AmplopDigital() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('8040179314').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="amplop-wrapper">
      <img
        src="/konten4/amplop-digital.webp"
        alt="amplop digital"
        className="amplop-full-img"
      />
      <div className="amplop-content">
        <div className="amplop-card-overlay">
          <div className="amplop-bca-logo">
            <img src="/konten4/BCA.webp" alt="BCA" className="amplop-bca-img" />
          </div>
          <div className="amplop-account-box">
            <span className="amplop-account-number">8040179314</span>
          </div>
          <p className="amplop-name">ZAINAL ABIDIN</p>
          <button className="amplop-copy-btn" onClick={handleCopy}>
            {copied ? 'Tersalin!' : 'Salin Nomor Rekening'}
          </button>
        </div>
        <div className="amplop-maps-link">
          <a href="https://maps.app.goo.gl/N7Ct31qXmGHeKG4p6" target="_blank" rel="noopener noreferrer">
            Lokasi (Google Maps)
          </a>
        </div>
      </div>
    </div>
  )
}
