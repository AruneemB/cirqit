import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useCircuitStore } from '../store/circuitStore'
import { TopBar } from '../components/TopBar'
import { LearningTooltip } from '../components/LearningTooltip'
import { TutorialModal } from '../components/TutorialModal'
import { gateExplanations, tutorials } from '../data/learningContent'

describe('Learning Mode Toggle', () => {
  beforeEach(() => {
    useCircuitStore.setState({ learningMode: false })
  })

  it('renders the Learn button in TopBar', () => {
    render(<TopBar onCommandBarOpen={vi.fn()} />)
    expect(screen.getByTitle('Enable Learning Mode')).toBeInTheDocument()
  })

  it('toggles learning mode on click', () => {
    render(<TopBar onCommandBarOpen={vi.fn()} />)
    const btn = screen.getByTitle('Enable Learning Mode')
    fireEvent.click(btn)
    expect(useCircuitStore.getState().learningMode).toBe(true)
  })

  it('shows Tutorials button when learning mode is active', () => {
    useCircuitStore.setState({ learningMode: true })
    render(<TopBar onCommandBarOpen={vi.fn()} />)
    expect(screen.getByTitle('Open tutorials')).toBeInTheDocument()
  })

  it('hides Tutorials button when learning mode is off', () => {
    render(<TopBar onCommandBarOpen={vi.fn()} />)
    expect(screen.queryByTitle('Open tutorials')).not.toBeInTheDocument()
  })

  it('opens TutorialModal when Tutorials button is clicked', () => {
    useCircuitStore.setState({ learningMode: true })
    render(<TopBar onCommandBarOpen={vi.fn()} />)
    fireEvent.click(screen.getByTitle('Open tutorials'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('LearningTooltip', () => {
  it('renders children with info icon', () => {
    render(<LearningTooltip entry={gateExplanations.H}>H Gate</LearningTooltip>)
    expect(screen.getByText('H Gate')).toBeInTheDocument()
    expect(screen.getByLabelText('Learn about Hadamard Gate (H)')).toBeInTheDocument()
  })

  it('shows modal with title and body on icon click', () => {
    render(<LearningTooltip entry={gateExplanations.H} />)
    fireEvent.click(screen.getByLabelText('Learn about Hadamard Gate (H)'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Hadamard Gate (H)')).toBeInTheDocument()
    expect(screen.getByText(gateExplanations.H.body)).toBeInTheDocument()
  })

  it('displays formula when present', () => {
    render(<LearningTooltip entry={gateExplanations.H} />)
    fireEvent.click(screen.getByLabelText('Learn about Hadamard Gate (H)'))
    expect(screen.getByText(gateExplanations.H.formula!)).toBeInTheDocument()
  })

  it('closes modal on close button click', () => {
    render(<LearningTooltip entry={gateExplanations.H} />)
    fireEvent.click(screen.getByLabelText('Learn about Hadamard Gate (H)'))
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes modal on backdrop click', () => {
    render(<LearningTooltip entry={gateExplanations.H} />)
    fireEvent.click(screen.getByLabelText('Learn about Hadamard Gate (H)'))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('TutorialModal', () => {
  it('does not render when closed', () => {
    render(<TutorialModal isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders tutorial list when open', () => {
    render(<TutorialModal isOpen onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    tutorials.forEach((t) => {
      expect(screen.getByText(t.title)).toBeInTheDocument()
    })
  })

  it('enters first tutorial on click', () => {
    render(<TutorialModal isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByText(tutorials[0].title))
    expect(screen.getByText(tutorials[0].steps[0].title)).toBeInTheDocument()
  })

  it('advances to next step', () => {
    render(<TutorialModal isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByText(tutorials[0].title))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText(tutorials[0].steps[1].title)).toBeInTheDocument()
  })

  it('goes back to tutorial list from first step', () => {
    render(<TutorialModal isOpen onClose={vi.fn()} />)
    fireEvent.click(screen.getByText(tutorials[0].title))
    fireEvent.click(screen.getByText('All Tutorials'))
    tutorials.forEach((t) => {
      expect(screen.getByText(t.title)).toBeInTheDocument()
    })
  })

  it('calls onClose when Finish is clicked on last step', () => {
    const onClose = vi.fn()
    render(<TutorialModal isOpen onClose={onClose} />)
    fireEvent.click(screen.getByText(tutorials[0].title))
    const { steps } = tutorials[0]
    for (let i = 0; i < steps.length - 1; i++) {
      fireEvent.click(screen.getByText('Next'))
    }
    fireEvent.click(screen.getByText('Finish'))
    expect(onClose).toHaveBeenCalled()
  })

  it('opens directly to a tutorial when initialTutorialId is provided', () => {
    render(<TutorialModal isOpen onClose={vi.fn()} initialTutorialId={tutorials[0].id} />)
    expect(screen.getByText(tutorials[0].steps[0].title)).toBeInTheDocument()
  })

  it('renders step progress indicator', () => {
    render(<TutorialModal isOpen onClose={vi.fn()} initialTutorialId={tutorials[0].id} />)
    expect(screen.getByText(`Step 1 of ${tutorials[0].steps.length}`)).toBeInTheDocument()
  })
})
