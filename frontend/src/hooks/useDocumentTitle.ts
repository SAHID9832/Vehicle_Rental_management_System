import { useEffect } from 'react';

/**
 * Custom hook to update document title dynamically with brand suffix.
 */
export function useDocumentTitle(title: string, prevailOnUnmount: boolean = false): void {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} | Vektor Rentals` : 'Vektor Rentals — DSA Driven Fleet';

    return () => {
      if (!prevailOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, prevailOnUnmount]);
}

export default useDocumentTitle;
