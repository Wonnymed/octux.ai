import { describe, it, expect } from 'vitest';
import { userRequestedContextFree } from '@/lib/chat/memoryPolicy';

describe('memoryPolicy', () => {
  it('detects English ignore phrases', () => {
    expect(userRequestedContextFree('Forget context — should I quit?')).toBe(true);
    expect(userRequestedContextFree('Just answer: is 2+2 four?')).toBe(true);
    expect(userRequestedContextFree('Ignore previous chats. What is Bitcoin?')).toBe(true);
  });

  it('detects Portuguese ignore phrases', () => {
    expect(userRequestedContextFree('Ignora o contexto. Devo investir?')).toBe(true);
    expect(userRequestedContextFree('Sem contexto: o que é inflação?')).toBe(true);
  });

  it('allows normal questions', () => {
    expect(userRequestedContextFree('Should I quit my job after 9 years?')).toBe(false);
    expect(userRequestedContextFree('What is Bitcoin?')).toBe(false);
  });
});
