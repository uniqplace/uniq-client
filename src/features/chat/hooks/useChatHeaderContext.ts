import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { ThreadContext } from '../chatTypes';

export function useChatHeaderContext(context?: ThreadContext): Partial<ThreadContext> {
  const currentThread = useSelector((state: RootState) => state.chat.currentThread);
  return context ?? currentThread?.context ?? {};
}
