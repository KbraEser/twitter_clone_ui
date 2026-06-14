import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout, selectDisplayName, selectEmail, selectUserId } from '../store/authSlice'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-full px-4 py-3 text-lg font-medium text-twitter-text no-underline transition-colors hover:bg-[#181818] hover:no-underline md:text-[1.1rem]',
    isActive ? 'font-bold' : '',
  ].join(' ')

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const email = useAppSelector(selectEmail)
  const displayName = useAppSelector(selectDisplayName)
  const userId = useAppSelector(selectUserId)

  return (
    <aside className="sticky top-0 flex h-screen w-[72px] flex-col gap-2 border-r border-twitter-border p-2 md:w-[260px] md:p-4 md:items-stretch items-center">
      <div className="mb-2 px-2 py-2 text-2xl text-twitter-text md:mb-4 md:text-[2rem]">𝕏</div>
      <nav className="flex flex-1 flex-col gap-1">
        <NavLink to="/" className={navLinkClass}>
          Ana Sayfa
        </NavLink>
        <NavLink to={`/profile/${userId}`} className={navLinkClass}>
          Profil
        </NavLink>
      </nav>
      <button
        type="button"
        className="mt-auto rounded-full border border-twitter-border bg-transparent px-2 py-2 text-xs text-twitter-text hover:bg-[#181818] md:px-4 md:py-2.5 md:text-base"
        onClick={() => dispatch(logout())}
      >
        Çıkış Yap
      </button>
      <div className="break-all px-2 py-2 text-xs text-twitter-muted md:px-4 md:text-sm">
        {displayName && <div>{displayName}</div>}
        {email}
      </div>
    </aside>
  )
}
