import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import CountdownTimer from './components/CountdownTimer'
import GallerySlider from './components/GallerySlider'
import AmplopDigital from './components/AmplopDigital'
import AttendanceForm from './components/AttendanceForm'
import Guestbook from './components/Guestbook'
import ClosingPage from './components/ClosingPage'
import Dashboard from './components/Dashboard'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
}

function CoverSection({ onOpen }) {
  const guestName =
    new URLSearchParams(window.location.search).get('to') || 'Tamu Undangan'
  const btnRef = useRef(null)

  const handleOpen = () => {
    const btn = btnRef.current
    if (btn) {
      btn.classList.remove('cover-open-btn--shine')
      void btn.offsetWidth
      btn.classList.add('cover-open-btn--shine')
    }
    onOpen()
  }

  return (
    <div className="cover-container">
      {/* Layer 1: Background */}
      <div className="cover-layer-bg" />

      {/* Layer 2: Gunungan */}
      <div className="cover-layer-gunungan" />

      {/* Layer 3: Bunga */}
      <div className="cover-layer-bunga" />

      {/* Layer 4: Border */}
      <div className="cover-layer-border" />

      {/* Layer 5: Konten1 */}
      <div className="cover-layer-konten1" />

      <motion.div
        className="cover-content"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        <div className="cover-bottom">
          <motion.div className="cover-guest-box" variants={fadeInUp}>
            <p className="cover-guest-to">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p className="cover-guest-name">{guestName}</p>
            <p className="cover-guest-note">
              Mohon maaf apabila terdapat kesalahan dalam penulisan nama/gelar.
            </p>
          </motion.div>

          <motion.button
            ref={btnRef}
            className="cover-open-btn"
            variants={fadeInUp}
            onClick={handleOpen}
          >
            Buka Undangan
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function GapuraOpening() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`gapura-opening ${open ? 'gapura-opening--open' : ''}`}>
      <img src="/gapura.webp" alt="gapura kiri" className="gapura-img gapura-img-left" />
      <img src="/gapura.webp" alt="gapura kanan" className="gapura-img gapura-img-right" />
    </div>
  )
}

function PageSection({ index, images, showGapura, gallery, amplop, mapsUrl, form, guestbook, closing }) {
  const konten = `/konten${index}.webp`
  const animateDecor = !form && !guestbook && !amplop

  return (
    <section className="invite-page">
      {/* Reused layers: bg, gunungan, bunga, border */}
      <div className="cover-layer-bg" />
      <div className={`cover-layer-gunungan${animateDecor ? '' : ' no-float'}`} />
      <div className={`cover-layer-bunga${animateDecor ? '' : ' no-float'}`} />
      <div className="cover-layer-border" />

      {/* Attendance form page */}
      {form ? (
        <AttendanceForm />
      ) : guestbook ? (
        <Guestbook />
      ) : closing ? (
        <ClosingPage />
      ) : amplop ? (
        <AmplopDigital />
      ) : gallery ? (
        <div className="gallery-stack">
          {/* Header (Our Gallery) - full bleed */}
          <img src={gallery[0]} alt="our gallery" className="gallery-header" />
          {/* Auto-sliding photos overlay */}
          <GallerySlider images={gallery.slice(1)} />
        </div>
      ) : images ? (
        <div className="page-konten3-stack">
          {images.map((item, i) =>
            item === 'timer' ? (
              <CountdownTimer key={i} />
            ) : (
              <img key={i} src={item} alt={`konten ${index} ${i + 1}`} className="page-konten3-img" />
            )
          )}
        </div>
      ) : (
        <div className={`page-layer-konten page-layer-konten-${index}`} style={{ backgroundImage: `url('${konten}')` }} />
      )}

      {/* Maps link overlay */}
      {mapsUrl && (
        <div className="page-maps-link">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            Lokasi (Google Maps)
          </a>
        </div>
      )}

      {/* Gapura opening overlay */}
      {showGapura && <GapuraOpening />}
    </section>
  )
}

function MultiPageSection() {
  const pages = [2, 3, 4, 5, 6, 7, 8]

  const konten3Images = [
    '/konten3/save-the-date.webp',
    'timer'
  ]

  const galleryImages = [
    '/konten4/our gallery.webp',
    '/konten4/gambar1.webp',
    '/konten4/gambar2.webp',
    '/konten4/gambar3.webp',
    '/konten4/gambar4.webp',
    '/konten4/gambar5.webp',
    '/konten4/gambar6.webp'
  ]

  return (
    <div className="multi-page-wrapper">
      {pages.map((n) => (
        <PageSection
          key={n}
          index={n}
          images={n === 3 ? konten3Images : undefined}
          gallery={n === 4 ? galleryImages : undefined}
          amplop={n === 5}
          form={n === 6}
          guestbook={n === 7}
          closing={n === 8}
          mapsUrl={n === 3 ? 'https://maps.app.goo.gl/7paDEStubjaWSGrLA' : undefined}
          showGapura={n === 2}
        />
      ))}
    </div>
  )
}

function AudioToggle({ audioRef, playing, onToggle }) {
  return (
    <>
      <audio ref={audioRef} src="/backsound.mp3" loop preload="auto" />
      <button
        type="button"
        className={`audio-toggle ${playing ? 'is-playing' : ''}`}
        onClick={onToggle}
        aria-label={playing ? 'Matikan musik' : 'Putar musik'}
      >
        <span className="audio-toggle-icon" />
        <span className="audio-toggle-label">{playing ? 'Musik On' : 'Musik Off'}</span>
      </button>
    </>
  )
}

function App() {
  const [page, setPage] = useState('cover') // 'cover' | 'content'
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
    return <Dashboard />
  }

  const startAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.play().then(() => setPlaying(true)).catch(() => {})
  }

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const goToContent = () => {
    startAudio()
    setPage('content')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <div className="app">
      <h1 className="sr-only">Undangan Khitan &amp; Rasulan Kenzie &amp; Puja</h1>
      <AudioToggle audioRef={audioRef} playing={playing} onToggle={toggleAudio} />
      <AnimatePresence mode="wait">
        {page === 'cover' && (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <CoverSection onOpen={goToContent} />
          </motion.div>
        )}

        {page === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <MultiPageSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
