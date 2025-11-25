import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { SignInBtn } from '../../components/signInBtn'

// Mock the next-auth module $ sign in func
jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
}));


describe('SignInBtn', () => {
    it('renders and calls correctly', () => {
        render(<SignInBtn/>)

        // make sure main title displays
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()

        // check sign in gets called, specifically next-auth/react.signIn()
        fireEvent.click(button)
        expect(require('next-auth/react').signIn).toHaveBeenCalledTimes(1);
    })
})