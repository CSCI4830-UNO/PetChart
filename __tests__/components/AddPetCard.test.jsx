import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { AddPetCard } from '../../components/AddPetCard'

// Add to the top of your test file or setup file
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn()
        })),
}));


// mock userRouter.push()
jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn()
    })),
}));

// Mock the next-auth module
jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
}));

describe('AddPetCard', () => {
    it('renders and calls correctly', () => {
        render(<AddPetCard/>)

        // check title displays
        const titleElement = screen.getByText("Add New Pet")
        expect(titleElement).toBeInTheDocument()

        // make sure the button displays
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()

        // check button click
        fireEvent.click(button); 
    })
})



