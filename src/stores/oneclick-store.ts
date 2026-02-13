import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OneclickState {
  selectedTemplateId: string | null;
  siteName: string;
  currentStep: number;
  setSelectedTemplateId: (id: string | null) => void;
  setSiteName: (name: string) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  selectedTemplateId: null,
  siteName: '',
  currentStep: 0,
};

export const useOneclickStore = create<OneclickState>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
      setSiteName: (name) => set({ siteName: name }),
      setCurrentStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: 'linkmap-oneclick',
      // Don't persist sensitive data like vercelToken
      partialize: (state) => ({
        selectedTemplateId: state.selectedTemplateId,
        siteName: state.siteName,
        currentStep: state.currentStep,
      }),
    }
  )
);
