import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {Chat} from '@/components/chat'

describe('Chat Component', () => {
  it('renders chat interface', () => {
    render(<Chat />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('sends messages and receives responses', async () => {
    render(<Chat />)
    const input = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(submitButton)

    expect(await screen.findByText('Mock response')).toBeInTheDocument()
  })
})