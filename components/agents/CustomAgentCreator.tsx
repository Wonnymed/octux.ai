'use client';

import { useState } from 'react';
import { OctButton } from '@/components/sukgo';
import { OctDialog, OctInput, OctTextarea, OctToggle } from '@/components/ui';

export interface CustomAgent {
  id: string;
  name: string;
  role: string;
  perspective: string;
  constraint?: string;
  saveToLibrary: boolean;
}

interface CustomAgentCreatorProps {
  open: boolean;
  onClose: () => void;
  onCreate: (agent: CustomAgent) => void;
}

export default function CustomAgentCreator({ open, onClose, onCreate }: CustomAgentCreatorProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [perspective, setPerspective] = useState('');
  const [constraint, setConstraint] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || !role.trim()) return;

    onCreate({
      id: `custom_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      perspective: perspective.trim(),
      constraint: constraint.trim() || undefined,
      saveToLibrary,
    });

    setName('');
    setRole('');
    setPerspective('');
    setConstraint('');
    setSaveToLibrary(false);
    onClose();
  };

  return (
    <OctDialog
      open={open}
      onClose={onClose}
      title="Create Custom Agent"
      description="Add a specialist with unique expertise to this simulation"
      size="md"
      footer={
        <>
          <OctButton variant="secondary" size="sm" onClick={onClose}>Cancel</OctButton>
          <OctButton variant="default" size="sm" onClick={handleCreate} disabled={!name.trim() || !role.trim()}>
            Create agent
          </OctButton>
        </>
      }
    >
      <div className="space-y-4">
        <OctInput
          label="Agent Name"
          placeholder="e.g., Korean F&B Market Expert"
          value={name}
          onChange={e => setName(e.target.value)}
          helperText="A descriptive name for this specialist"
        />

        <OctInput
          label="Role / Expertise"
          placeholder="e.g., Specialist in Korean food & beverage market dynamics"
          value={role}
          onChange={e => setRole(e.target.value)}
          helperText="What does this agent know about?"
        />

        <OctTextarea
          label="Perspective / Bias"
          placeholder="e.g., Tends to be conservative about new entrants, focuses on unit economics and local competition patterns"
          value={perspective}
          onChange={e => setPerspective(e.target.value)}
          minRows={2}
          maxRows={4}
          helperText="How does this agent think? What's their angle?"
        />

        <OctInput
          label="Key Constraint (optional)"
          placeholder="e.g., Must reference actual KOSIS data when available"
          value={constraint}
          onChange={e => setConstraint(e.target.value)}
          helperText="A rule this agent must follow"
        />

        <OctToggle
          checked={saveToLibrary}
          onChange={setSaveToLibrary}
          label="Save to my agent library"
          description="Reuse this agent in future simulations"
          size="sm"
        />
      </div>
    </OctDialog>
  );
}
