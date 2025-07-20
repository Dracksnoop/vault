import { createContext, useContext, useState, ReactNode } from 'react';

interface InvoiceContextType {
  showCreateInvoiceModal: boolean;
  setShowCreateInvoiceModal: (show: boolean) => void;
  openCreateInvoiceModal: () => void;
  closeCreateInvoiceModal: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  const openCreateInvoiceModal = () => setShowCreateInvoiceModal(true);
  const closeCreateInvoiceModal = () => setShowCreateInvoiceModal(false);

  return (
    <InvoiceContext.Provider value={{
      showCreateInvoiceModal,
      setShowCreateInvoiceModal,
      openCreateInvoiceModal,
      closeCreateInvoiceModal,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}