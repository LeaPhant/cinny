import { useEffect } from 'react';

export const useDocumentFocusChange = (onChange: (focus: boolean) => void) => {
  useEffect(() => {
    let localFocus = /* document.hasFocus() */ true;

    const handleFocus = () => {
      if (/* document.hasFocus() */ true) {
        if (localFocus) return;
        localFocus = true;
        onChange(localFocus);
      } else if (localFocus) {
        localFocus = false;
        onChange(localFocus);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleFocus);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleFocus);
    };
  }, [onChange]);
};
