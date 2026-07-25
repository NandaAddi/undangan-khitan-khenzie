import { useState, useEffect, useRef } from 'react'

export default function AmplopDigital() {
  const [copied, setCopied] = useState(false)
  const mapsLinkRef = useRef(null)

  useEffect(() => {
    const el = mapsLinkRef.current
    if (!el) return

    const updatePosition = () => {
      const vh = window.visualViewport?.height || window.innerHeight
      el.style.bottom = `${vh * 0.22}px`
    }

    updatePosition()

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updatePosition)
      window.visualViewport.addEventListener('scroll', updatePosition)
    }
    window.addEventListener('resize', updatePosition)

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updatePosition)
        window.visualViewport.removeEventListener('scroll', updatePosition)
      }
      window.removeEventListener('resize', updatePosition)
    }
  }, [])

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
      <div className="amplop-maps-link" ref={mapsLinkRef}>
        <a href="https://maps.app.goo.gl/N7Ct31qXmGHeKG4p6" target="_blank" rel="noopener noreferrer">
          <img src="/konten4/button-lokasi.webp" alt="Lokasi Google Maps" className="amplop-maps-btn" />
        </a>
        <p className="amplop-maps-address">
          Jl. Muara Angke PHPT Pengasinan<br />
          Blok K no.2 Rt.009 Rw.011<br />
          Kel. Pluit Kec. Penjaringan<br />
          Jakarta Utara 14450
        </p>
      </div>
    </div>
  )
}
