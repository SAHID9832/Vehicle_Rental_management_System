import { useEffect } from 'react';

/**
 * Custom hook to update document title dynamically with brand suffix.
 */
export function useDocumentTitle(title: string, prevailOnUnmount: boolean = false): void {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} | Movo` : 'Movo — Vehicle Rental | Move Your Way';

    return () => {
      if (!prevailOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, prevailOnUnmount]);
}

export default useDocumentTitle;
