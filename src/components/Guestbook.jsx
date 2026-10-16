import { useState, useEffect } from 'react'
import { supabase, GUESTBOOK_TABLE } from '../lib/supabase'

const PAGE_SIZE = 5

export default function Guestbook() {
  const [wishes, setWishes] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)
  const [error, setError] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchPage = async (targetPage) => {
    if (targetPage === page && wishes.length > 0) return
    setLoadingPage(true)
    const from = (targetPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from(GUESTBOOK_TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
    if (!error && data) {
      setWishes(data)
      setPage(targetPage)
      if (total === 0) setTotal(0)
    } else {
      setError(true)
    }
    setLoadingPage(false)
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      const { count } = await supabase
        .from(GUESTBOOK_TABLE)
        .select('*', { count: 'exact', head: true })
      setTotal(count || 0)
      const { data, error } = await supabase
        .from(GUESTBOOK_TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1)
      if (!error && data) setWishes(data)
      else setError(true)
      setLoading(false)
    }
    init()
  }, [])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    fetchPage(p)
  }

  return (
    <div className="attendance-stack guestbook-stack">
      <h2 className="attendance-title">Buku Tamu</h2>

      <div className="attendance-guestbook">
        {loading ? (
          <p className="attendance-empty">Memuat...</p>
        ) : error ? (
          <p className="attendance-empty">Gagal memuat buku tamu.</p>
        ) : wishes.length === 0 ? (
          <p className="attendance-empty">Belum ada ucapan.</p>
        ) : (
          <>
            <div className="attendance-wish-column">
              {wishes.map((w) => (
                <div className="attendance-wish" key={w.id}>
                  <p className="attendance-wish-name">{w.nama}</p>
                  <p className="attendance-wish-meta">
                    {w.kehadiran}
                    {w.jumlah_tamu ? ` · ${w.jumlah_tamu} tamu` : ''}
                  </p>
                  <p className="attendance-wish-text">{w.ucapan}</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="attendance-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={
                      'attendance-page-btn' + (p === page ? ' is-active' : '')
                    }
                    onClick={() => goToPage(p)}
                    disabled={loadingPage}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
