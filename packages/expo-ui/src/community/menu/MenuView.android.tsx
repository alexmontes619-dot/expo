import * as React from 'react';
import { Pressable, View } from 'react-native';

import type { MenuAction, MenuComponentProps, NativeActionEvent } from './types';
import { HorizontalDivider } from '../../jetpack-compose/Divider';
import { DropdownMenu } from '../../jetpack-compose/DropdownMenu';
import {
  DropdownMenuItem,
  type DropdownMenuItemElementColors,
} from '../../jetpack-compose/DropdownMenu/DropdownMenuItem';
import { Host } from '../../jetpack-compose/Host';
import { Icon } from '../../jetpack-compose/Icon';
import { RNHostView } from '../../jetpack-compose/RNHostView';
import { Text as ComposeText } from '../../jetpack-compose/Text';

function actionId(action: MenuAction): string {
  return action.id ?? action.title;
}

function makeEvent(action: MenuAction): NativeActionEvent {
  return { nativeEvent: { event: actionId(action) } };
}

function buildElementColors(action: MenuAction): DropdownMenuItemElementColors | undefined {
  // Icon color flows through the `Icon` component's own `tint` prop below, which
  // gives finer control than threading it through `DropdownMenuItem.elementColors`.
  const { titleColor } = action;
  if (titleColor == null) {
    return undefined;
  }
  return { textColor: titleColor, disabledTextColor: titleColor };
}

type ItemProps = {
  action: MenuAction;
  onPressAction: MenuComponentProps['onPressAction'];
  dismissAll: () => void;
};

function MenuActionItem({ action, onPressAction, dismissAll }: ItemProps) {
  const [submenuExpanded, setSubmenuExpanded] = React.useState(false);

  if (action.attributes?.hidden) {
    return null;
  }

  const { subactions, displayInline, state, attributes, title, image, imageColor } = action;
  // `image` is non-string only when caller passes an ImageSourcePropType
  // (number from `require()` or `{ uri }`). The string form is iOS-only (SF Symbol).
  const leadingIconSource = typeof image === 'string' || image == null ? null : image;
  const elementColors = buildElementColors(action);

  if (subactions && subactions.length > 0) {
    if (displayInline) {
      return (
        <>
          <HorizontalDivider />
          {subactions.map((sub) => (
            <MenuActionItem
              key={actionId(sub)}
              action={sub}
              onPressAction={onPressAction}
              dismissAll={dismissAll}
            />
          ))}
          <HorizontalDivider />
        </>
      );
    }
    return (
      <DropdownMenu expanded={submenuExpanded} onDismissRequest={() => setSubmenuExpanded(false)}>
        <DropdownMenu.Trigger>
          <DropdownMenuItem
            enabled={!attributes?.disabled}
            elementColors={elementColors}
            onClick={() => setSubmenuExpanded(true)}>
            <DropdownMenuItem.Text>
              <ComposeText>{title}</ComposeText>
            </DropdownMenuItem.Text>
            {leadingIconSource && (
              <DropdownMenuItem.LeadingIcon>
                <Icon source={leadingIconSource} size={24} tint={imageColor} />
              </DropdownMenuItem.LeadingIcon>
            )}
          </DropdownMenuItem>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {subactions.map((sub) => (
            <MenuActionItem
              key={actionId(sub)}
              action={sub}
              onPressAction={onPressAction}
              dismissAll={() => {
                setSubmenuExpanded(false);
                dismissAll();
              }}
            />
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenuItem
      role={attributes?.destructive ? 'destructive' : 'default'}
      enabled={!attributes?.disabled}
      elementColors={elementColors}
      onClick={() => {
        onPressAction?.(makeEvent(action));
        dismissAll();
      }}>
      <DropdownMenuItem.Text>
        <ComposeText>{title}</ComposeText>
      </DropdownMenuItem.Text>
      {leadingIconSource && (
        <DropdownMenuItem.LeadingIcon>
          <Icon source={leadingIconSource} size={24} tint={imageColor} />
        </DropdownMenuItem.LeadingIcon>
      )}
      {state === 'on' && (
        <DropdownMenuItem.TrailingIcon>
          <ComposeText>✓</ComposeText>
        </DropdownMenuItem.TrailingIcon>
      )}
    </DropdownMenuItem>
  );
}

/**
 * A drop-in replacement for `@react-native-menu/menu` on Android.
 * Wraps the trigger in a `Pressable` (whose `onPress`/`onLongPress` opens the menu) and
 * renders the actions tree as a controlled Material `DropdownMenu`.
 *
 * Note: when `action.image` is a string, it is treated as an iOS SF Symbol and ignored
 * on Android — pass an `ImageSourcePropType` (e.g. `require('./icon.xml')`) to render
 * a leading icon. `MenuView.title` is also unused on Android since Material
 * `DropdownMenu` has no title slot.
 */
export function MenuView(props: MenuComponentProps) {
  const {
    actions,
    onPressAction,
    onOpenMenu,
    onCloseMenu,
    shouldOpenOnLongPress,
    style,
    children,
    testID,
  } = props;
  const [expanded, setExpanded] = React.useState(false);
  // Mirror `expanded` into a ref and flip it eagerly inside the callbacks so a
  // second call within the same React tick is a no-op (the state update is
  // async and wouldn't otherwise reflect back to the ref in time).
  const expandedRef = React.useRef(false);

  const open = React.useCallback(() => {
    if (expandedRef.current) return;
    expandedRef.current = true;
    setExpanded(true);
    onOpenMenu?.();
  }, [onOpenMenu]);

  const dismissAll = React.useCallback(() => {
    if (!expandedRef.current) return;
    expandedRef.current = false;
    setExpanded(false);
    onCloseMenu?.();
  }, [onCloseMenu]);

  return (
    <View style={style} testID={testID}>
      <Host matchContents>
        <DropdownMenu expanded={expanded} onDismissRequest={dismissAll}>
          <DropdownMenu.Trigger>
            <RNHostView matchContents>
              <Pressable
                onPress={shouldOpenOnLongPress ? undefined : open}
                onLongPress={shouldOpenOnLongPress ? open : undefined}>
                {children}
              </Pressable>
            </RNHostView>
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            {actions.map((action) => (
              <MenuActionItem
                key={actionId(action)}
                action={action}
                onPressAction={onPressAction}
                dismissAll={dismissAll}
              />
            ))}
          </DropdownMenu.Items>
        </DropdownMenu>
      </Host>
    </View>
  );
}
