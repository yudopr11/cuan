import { useEffect } from 'react';

/**
 * Hook to set the page title dynamically
 * @param title The title to set for the page
 */
export default function usePageTitle(title: string): void {
  useEffect(() => {
    // Set the document title
    const previousTitle = document.title;
    document.title = `${title} | Cuan`;
    
    // Reset the title when the component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
} 