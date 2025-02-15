import { describe, it, expect } from 'vitest'
import { systemPrompt } from '@/lib/ai/prompts'

describe('AI Prompts', () => {
  it('returns regular prompt for chat-model-reasoning', () => {
    const prompt = systemPrompt({ selectedChatModel: 'chat-model-reasoning' })
    expect(prompt).toContain('You are a friendly assistant')
  })

  it('includes artifacts prompt for other models', () => {
    const prompt = systemPrompt({ selectedChatModel: 'other-model' })
    expect(prompt).toContain('You are a friendly assistant')
    expect(prompt).toContain('artifactsPrompt')
  })
})