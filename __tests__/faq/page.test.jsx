import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../../app/faq/page'

describe('Page', () => {
    it('renders all the questions', () => {
        render(<Page />)

        // make sure main title displays
        const mainTitle = screen.getAllByRole('heading', { level: 1 })
        expect(mainTitle[0]).toHaveTextContent("FAQs")

        // make sure all cards display
        const headings = screen.getAllByRole('heading', { level: 2 })

        expect(headings[0]).toBeInTheDocument()
        expect(headings[0]).toHaveTextContent("What is PetChart?")

        expect(headings[1]).toBeInTheDocument()
        expect(headings[1]).toHaveTextContent("How do I add a pet?")

        expect(headings[2]).toBeInTheDocument()
        expect(headings[2]).toHaveTextContent("Can I track vaccinations and get reminders?")

        expect(headings[3]).toBeInTheDocument()
        expect(headings[3]).toHaveTextContent("How do medications work?")

        expect(headings[4]).toBeInTheDocument()
        expect(headings[4]).toHaveTextContent("Is my data private?")

        expect(headings[5]).toBeInTheDocument()
        expect(headings[5]).toHaveTextContent("Can I share records with my vet or daycare?")

        expect(headings[6]).toBeInTheDocument()
        expect(headings[6]).toHaveTextContent("How much does PetChart cost?")

        expect(headings[7]).toBeInTheDocument()
        expect(headings[7]).toHaveTextContent("How do I contact support?")
    })
})