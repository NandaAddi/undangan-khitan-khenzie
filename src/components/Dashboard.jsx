import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DASH_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || 'masuk123'

const TEMPLATE = `Assalamualaikum Warahmatullahi Wabarakatuh.

Yth. Bapak/Ibu/Saudara/i

Dengan memohon rahmat dan ridho Allah SWT, serta tanpa mengurangi rasa hormat, melalui pesan ini kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Khitanan putra kami:

Muhammad Kaka' Alkhalifi
Putra dari Bapak Zainal Abidin (Zainal) dan Ibu Pitriyanti (Pipit)

Berikut link undangan kami. Untuk informasi lengkap mengenai waktu, lokasi, dan rangkaian acara, silakan kunjungi:

[Masukkan Link Undangan]

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa agar ananda Muhammad Kaka' Alkhalifi senantiasa menjadi anak yang saleh, berbakti kepada orang tua, dan bermanfaat bagi agama, bangsa, dan negara.

Mohon maaf apabila undangan ini hanya kami sampaikan melalui pesan WhatsApp.

Atas perhatian, doa, dan kehadirannya, kami ucapkan terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.`

function buildWaLink(name) {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/?to=${encodeURIComponent(name)}`
}

export default function Dashboard() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem('dash_unlocked') === '1'
  )
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [guestName, setGuestName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  const [live, setLive] = useState([])
  const [liveTotal, setLiveTotal] = useState(0)
  const [liveError, setLiveError] = useState(false)

  const [tab, setTab] = useState('link')

  const generateLink = () => {
    const name = guestName.trim()
    if (!name) return
    setGeneratedLink(buildWaLink(name))
  }

  const copyLink = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const shareWA = () => {
    if (!generatedLink) return
    const msg = TEMPLATE.replace('[Masukkan Link Undangan]', generatedLink)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const deleteWish = async (id) => {
    const { error } = await supabase.from('khitan').delete().eq('id', id)
    if (!error) {
      setLive((prev) => prev.filter((w) => w.id !== id))
      setLiveTotal((t) => Math.max(0, t - 1))
    }
  }

  // Live guestbook: realtime subscription + polling safety net
  useEffect(() => {
    if (!unlocked) return
    let channel = null
    let poll = null

    const loadInitial = async () => {
      const { count } = await supabase
        .from('khitan')
        .select('*', { count: 'exact', head: true })
      setLiveTotal(count || 0)
      const { data, error } = await supabase
        .from('khitan')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (!error && data) setLive(data)
      else setLiveError(true)
    }
    loadInitial()

    try {
      channel = supabase
        .channel('khitan-live')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'khitan' },
          (payload) => {
            setLive((prev) => [payload.new, ...prev].slice(0, 20))
            setLiveTotal((t) => t + 1)
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'khitan' },
          (payload) => {
            setLive((prev) => prev.filter((w) => w.id !== payload.old.id))
            setLiveTotal((t) => Math.max(0, t - 1))
          }
        )
        .subscribe()
    } catch {
      /* realtime unavailable, polling covers it */
    }

    poll = setInterval(loadInitial, 10000)

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (poll) clearInterval(poll)
    }
  }, [unlocked])

  const submitPw = (e) => {
    e.preventDefault()
    if (pw === DASH_PASSWORD) {
      setUnlocked(true)
      sessionStorage.setItem('dash_unlocked', '1')
    } else {
      setPwError(true)
    }
  }

  if (!unlocked) {
    return (
      <div className="dash-app">
        <header className="dash-appbar">
          <h1 className="dash-appbar-title">Dashboard Undangan</h1>
        </header>
        <div className="dash-screen dash-screen--center">
          <form className="dash-card" onSubmit={submitPw}>
            <h2 className="dashboard-section-title">Masuk</h2>
            <label className="dashboard-label">Masukkan password untuk mengakses.</label>
            <input
              type="password"
              className="dashboard-input"
              placeholder="Password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value)
                setPwError(false)
              }}
              autoFocus
            />
            {pwError && <p className="dashboard-error">Password salah.</p>}
            <button type="submit" className="dashboard-btn dashboard-btn--primary">
              Masuk
            </button>
          </form>
        </div>
      </div>
    )
  }

  const renderTab = () => {
    if (tab === 'live') {
      return (
        <div className="dash-screen">
          <div className="dash-card">
            <h2 className="dashboard-section-title">
              Buku Tamu
              <span className="dashboard-live-dot" title="realtime" />
            </h2>
            <p className="dashboard-label">Total ucapan: {liveTotal}</p>
            {liveError ? (
              <p className="dashboard-error">Gagal memuat buku tamu.</p>
            ) : live.length === 0 ? (
              <p className="dashboard-success">Belum ada ucapan.</p>
            ) : (
              <div className="dashboard-live">
                {live.map((w) => (
                  <div className="dashboard-live-item" key={w.id}>
                    <div className="dashboard-live-head">
                      <p className="dashboard-live-name">{w.nama}</p>
                      <button
                        className="dashboard-live-del"
                        onClick={() => deleteWish(w.id)}
                        title="Hapus pesan"
                      >
                        Hapus
                      </button>
                    </div>
                    <p className="dashboard-live-meta">
                      {w.kehadiran}
                      {w.jumlah_tamu ? ` · ${w.jumlah_tamu} tamu` : ''}
                    </p>
                    <p className="dashboard-live-text">{w.ucapan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="dash-screen">
        <div className="dash-card">
          <h2 className="dashboard-section-title">Generate Link Undangan</h2>
          <label className="dashboard-label">Nama Tamu (untuk link personal)</label>
          <input
            type="text"
            className="dashboard-input"
            placeholder="cth. Bapak Ahmad"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <button className="dashboard-btn" onClick={generateLink}>
            Generate Link
          </button>
          {generatedLink && (
            <div className="dashboard-link-box">
              <code className="dashboard-link">{generatedLink}</code>
              <button className="dashboard-btn dashboard-btn--small" onClick={copyLink}>
                Salin
              </button>
            </div>
          )}
          {generatedLink && (
            <button
              className="dashboard-btn dashboard-btn--primary"
              onClick={shareWA}
            >
              Bagikan ke WhatsApp
            </button>
          )}
        </div>
        {copied && <p className="dashboard-success">Tersalin.</p>}
      </div>
    )
  }

  const tabs = [
    { id: 'link', label: 'Link' },
    { id: 'live', label: 'Buku Tamu' }
  ]

  return (
    <div className="dash-app">
      <header className="dash-appbar">
        <h1 className="dash-appbar-title">Dashboard Undangan</h1>
        <span className="dashboard-live-dot" title="live" />
      </header>

      {renderTab()}

      <nav className="dash-tabbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={'dash-tab' + (tab === t.id ? ' is-active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
