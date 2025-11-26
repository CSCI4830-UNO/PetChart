import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// mocks
jest.mock('next/image', () => ({ __esModule: true, default: (props) => <img {...props} /> }))
jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }))
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: (p) => <div {...p} /> }
}))
jest.mock('../../components/SignOutBtn', () => () => <div>SignOutBtnMock</div>)

import NavBar from '../../components/ui/navbar'

describe('NavBar', () => {
  beforeEach(() => {
    // reset scroll mock
    window.scrollTo = jest.fn()
  })

  it('shows Sign In if no session, clicking logo scrolls top', () => {
    render(<NavBar />)

    // should see Sign In link
    expect(screen.getByText('Sign In')).toBeInTheDocument()

    const logoLink = screen.getByText('PetChart').closest('a')
    expect(logoLink).not.toBeNull()
    if (logoLink) fireEvent.click(logoLink)

    expect(window.scrollTo).toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
  })

  it('toggles mobile menu when menu button clicked', () => {
    render(<NavBar />)

    const before = screen.getAllByText('Features').length
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    const after = screen.getAllByText('Features').length

    expect(after).toBeGreaterThan(before)
  })

  it('shows SignOutBtn when session exists', () => {
    // simulate logged in user
    const auth = require('next-auth/react')
    jest.spyOn(auth, 'useSession').mockImplementation(() => ({
      data: { user: { name: 'Tester' } }
    }))

    render(<NavBar />)
    expect(screen.getByText('SignOutBtnMock')).toBeInTheDocument()
  })
})
