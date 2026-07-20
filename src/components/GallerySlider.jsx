import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_INTERVAL = 3000

export default function GallerySlider({ images }) {
  const [index, setIndex] = useState(0)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, SLIDE_INTERVAL)
    return () => clearInterval(id)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <div className="gallery-slider">
      <AnimatePresence>
        <motion.img
          key={index}
          src={images[index]}
          alt={`gallery ${index + 1}`}
          className="gallery-slide"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onClick={() => setPreview(true)}
          style={{ cursor: 'pointer' }}
        />
      </AnimatePresence>

      <div className="gallery-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={i === index ? 'gallery-dot gallery-dot--active' : 'gallery-dot'}
          />
        ))}
      </div>

      <AnimatePresence>
        {preview &&
          createPortal(
            <motion.div
              className="gallery-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setPreview(false)}
            >
              <img
                src={images[index]}
                alt={`gallery ${index + 1}`}
                className="gallery-lightbox-img"
              />
              <span className="gallery-lightbox-hint">Ketuk untuk menutup</span>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </div>
  )
}
