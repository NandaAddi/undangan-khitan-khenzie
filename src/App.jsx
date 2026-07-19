import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
}

function CoverSection({ onOpen }) {
  const guestName = 'Tamu Undangan'

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
              Mohon maaf apabila terdapat kesalahan dalam<br />
              penulisan nama/gelar.
            </p>
          </motion.div>

          <motion.button
            className="cover-open-btn"
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpen}
          >
            Buka Undangan
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function PageSection({ index }) {
  const konten = `/konten${index}.webp`

  return (
    <section className="invite-page">
      {/* Reused layers: bg, gunungan, bunga, border */}
      <div className="cover-layer-bg" />
      <div className="cover-layer-gunungan" />
      <div className="cover-layer-bunga" />
      <div className="cover-layer-border" />

      {/* Konten page (jika ada) */}
      <div className={`page-layer-konten page-layer-konten-${index}`} style={{ backgroundImage: `url('${konten}')` }} />
    </section>
  )
}

function MultiPageSection() {
  const pages = [2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="multi-page-wrapper">
      {pages.map((n) => (
        <PageSection key={n} index={n} />
      ))}
    </div>
  )
}

function App() {
  const [page, setPage] = useState('cover') // 'cover' | 'content'
  const audioRef = useRef(null)

  const goToContent = () => {
    setPage('content')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {page === 'cover' && (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <CoverSection onOpen={goToContent} />
          </motion.div>
        )}

        {page === 'content' && (
          <motion.div
            key="content"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <MultiPageSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
