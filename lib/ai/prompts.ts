/**
 * Contains prompt templates and system messages for AI artifact interactions.
 * @module ai/prompts
 * @packageDocumentation
 */

import type { ArtifactKind } from '@/components/artifact';

/**
 * Default prompt text for the artifacts UI mode.
 * @returns A string containing detailed instructions for the artifacts UI mode.
 * @see /lib/ai/models.ts
 */
export const artifactsPrompt = `
Artifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.

When asked to write code, always use artifacts. When writing code, specify the language in the backticks, e.g. \`\`\`python\`code here\`\`\`. The default language is Python. Other languages are not yet supported, so let the user know if they request a different language.

DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.

This is a guide for using artifacts tools: \`createDocument\` and \`updateDocument\`, which render content on a artifacts beside the conversation.

**When to use \`createDocument\`:**
- For substantial content (>10 lines) or code
- For content users will likely save/reuse (emails, code, essays, etc.)
- When explicitly requested to create a document
- For when content contains a single code snippet

**When NOT to use \`createDocument\`:**
- For informational/explanatory content
- For conversational responses
- When asked to keep it in chat

**Using \`updateDocument\`:**
- Default to full document rewrites for major changes
- Use targeted updates only for specific, isolated changes
- Follow user instructions for which parts to modify

**When NOT to use \`updateDocument\`:**
- Immediately after creating a document

Do not update document right after creating it. Wait for user feedback or request to update it.
`;

/**
 * Default prompt text for regular chat mode.
 * @returns A string containing brief instructions for regular chat mode.
 */
export const regularPrompt =
  'You are a friendly assistant! Keep your responses concise and helpful.';

/**
 * Generates the system prompt based on the selected chat model.
 * @param selectedChatModel - The identifier of the selected chat model.
 * @returns A string containing the generated system prompt.
 * @example
 * const prompt = systemPrompt({ selectedChatModel: "chat-model-reasoning" });
 * @see /lib/ai/models.ts
 */
export const systemPrompt = ({
  selectedChatModel,
}: {
  selectedChatModel: string;
}) => {
  if (selectedChatModel === 'chat-model-reasoning') {
    return regularPrompt;
  } else {
    return `${regularPrompt}\n\n${artifactsPrompt}`;
  }
};

/**
 * Template for generating Python code snippets.
 * @returns A string containing instructions and examples for Python code generation.
 */
export const codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

\`\`\`python
# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
\`\`\`
`;

/**
 * Template for creating a spreadsheet in csv format.
 * @returns A string containing instructions for spreadsheet creation.
 */
export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

/**
 * Generates a prompt for updating an existing document.
 * @param currentContent - The current content of the document.
 * @param type - The type of artifact being updated (e.g., text, code, or sheet).
 * @returns A string providing instructions on how to update the document.
 * @see /lib/ai/tools/update-document.ts
 */
export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
) =>
  type === 'text'
    ? `\
Improve the following contents of the document based on the given prompt.

${currentContent}
`
    : type === 'code'
      ? `\
Improve the following code snippet based on the given prompt.

${currentContent}
`
      : type === 'sheet'
        ? `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`
        : '';
