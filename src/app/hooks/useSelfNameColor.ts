import { useSetting } from '../state/hooks/settings';
import { settingsAtom } from '../state/settings';
import { useMatrixClient } from './useMatrixClient';

export function useSelfNameColor(): (senderId: string | undefined) => string | undefined {
  const mx = useMatrixClient();
  const [selfNameColor] = useSetting(settingsAtom, 'selfNameColor');

  return (senderId) => (mx.getUserId() === senderId ? selfNameColor : undefined);
}
