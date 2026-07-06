import * as React from 'react';
import { createContext, useContext } from 'react';

export const AlertTextClassContext = createContext<string | undefined>(undefined);

export function useAlertTextClass(): string | undefined {
  return useContext(AlertTextClassContext);
}
