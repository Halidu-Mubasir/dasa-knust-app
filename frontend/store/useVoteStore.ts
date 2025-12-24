import { create } from 'zustand';
import { Election, Position, Candidate } from '@/types';

interface VoteStore {
    activeElection: Election | null;
    positions: Position[];
    candidates: Candidate[]; // All candidates
    currentStep: number;
    selections: Record<number, number>; // positionId -> candidateId

    // Actions
    setElectionData: (data: { election: Election; positions: Position[]; candidates: Candidate[] }) => void;
    nextStep: () => void;
    prevStep: () => void;
    selectCandidate: (positionId: number, candidateId: number) => void;
    reset: () => void;
    skipStep: () => void; // Explicitly for skipping/abstaining
}

export const useVoteStore = create<VoteStore>((set, get) => ({
    activeElection: null,
    positions: [],
    candidates: [],
    currentStep: 0,
    selections: {},

    setElectionData: ({ election, positions, candidates }) => set({
        activeElection: election,
        positions: positions.sort((a, b) => a.rank - b.rank), // Ensure ranked order
        candidates,
        currentStep: 0,
        selections: {}
    }),

    nextStep: () => {
        const { currentStep, positions } = get();
        // Allow going to next step (which might be the review step at index == positions.length)
        if (currentStep <= positions.length) {
            set({ currentStep: currentStep + 1 });
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
            set({ currentStep: currentStep - 1 });
        }
    },

    selectCandidate: (positionId, candidateId) => set((state) => ({
        selections: { ...state.selections, [positionId]: candidateId }
    })),

    // For skipping, we just move next without recording a selection for this position
    // Or we could record a specific SENTINEL value for abstain if backend requires it.
    // For now, let's assume missing key = abstain.
    skipStep: () => {
        const { currentStep, positions } = get();
        // Ensure we don't have a selection for this position
        const currentPos = positions[currentStep];
        if (currentPos) {
            const newSelections = { ...get().selections };
            delete newSelections[currentPos.id];
            set({ selections: newSelections, currentStep: currentStep + 1 });
        }
    },

    reset: () => set({
        activeElection: null,
        positions: [],
        candidates: [],
        currentStep: 0,
        selections: {}
    })
}));
