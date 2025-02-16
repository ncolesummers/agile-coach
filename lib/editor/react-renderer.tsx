/**
 * Provides utilities to render React components into DOM elements.
 * @module /lib/editor/react-renderer
 * @packageDocumentation
 */

import { createRoot } from 'react-dom/client';

/**
 * Renders a React component into a given DOM element and returns a method to unmount the component.
 * @class
 * @see /lib/editor/suggestions.tsx for widget integration examples
 * @example
 * const renderer = ReactRenderer.render(<MyComponent />, document.getElementById('app'));
 * renderer.destroy();
 */
export class ReactRenderer {
  /**
   * Renders the specified React component into the provided DOM element.
   * @param component - React component to render
   * @param dom - DOM element where the component is rendered
   * @returns An object with a destroy method to unmount the React component
   */
  static render(component: React.ReactElement, dom: HTMLElement) {
    const root = createRoot(dom);
    root.render(component);

    return {
      destroy: () => root.unmount(),
    };
  }
}
