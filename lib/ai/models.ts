import { fireworks } from '@ai-sdk/fireworks';
import { openai } from '@ai-sdk/openai';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

/** Default chat model ID used when none is specified */
export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

/** 
 * Custom provider configuration for language and image models
 * Includes multiple model configurations for different use cases
 */
export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': openai('gpt-4o-mini'),
    'chat-model-large': openai('gpt-4o'),
    'chat-model-reasoning': wrapLanguageModel({
      model: fireworks('accounts/fireworks/models/deepseek-r1'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': openai('gpt-4-turbo'),
    'artifact-model': openai('gpt-4o-mini'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

/** 
 * Represents a chat model configuration
 * @interface ChatModel
 * @property {string} id - The unique identifier of the model
 * @property {string} name - The name of the model
 * @property {string} description - A brief description of the model
 */
interface ChatModel {
    id: string;
    name: string;
    description: string;
}

/** Available chat models with their configurations */
export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Large model',
    description: 'Large model for complex, multi-step tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];
