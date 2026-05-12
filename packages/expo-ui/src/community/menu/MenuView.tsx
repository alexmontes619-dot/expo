import { useEffect } from 'react';
import { View } from 'react-native';

import type { MenuComponentProps } from './types';

let warned = false;

/**
 * A drop-in replacement for `@react-native-menu/menu`'s `MenuView`. Wrap any trigger
 * view; long-pressing or tapping (per `shouldOpenOnLongPress`) shows a popup menu
 * built from the `actions` tree.
 *
 * - On iOS, renders via SwiftUI's `Menu` (tap) or `ContextMenu` (long-press).
 * - On Android, renders via Compose's `DropdownMenu` anchored to a `Pressable`.
 * - On other platforms (web), the trigger renders inertly and actions do not fire;
 *   a one-time `console.warn` is emitted.
 *
 * @platform android
 * @platform ios
 */
export function MenuView(props: MenuComponentProps) {
  useEffect(() => {
    if (!warned) {
      warned = true;
      console.warn(
        "[@expo/ui] MenuView is currently iOS- and Android-only; the trigger will render but actions won't fire on this platform."
      );
    }
  }, []);
  return (
    <View style={props.style} testID={props.testID}>
      {props.children}
    </View>
  );
}
