import { render, screen } from '@testing-library/react'
import LoginPage from '../src/app/login/page'

test('renders login form', () => {
  render(<LoginPage />)
  expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument()
})