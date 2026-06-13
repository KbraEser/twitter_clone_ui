import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1100px]">
      <Sidebar />
      <main className="min-h-screen flex-1 border-r border-twitter-border">
        <Outlet />
      </main>
    </div>
  )
}
