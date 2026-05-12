package expo.modules.ui.menu

import android.graphics.Color
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.runtime.Composable
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.Enumerable
import expo.modules.kotlin.types.OptimizedRecord
import expo.modules.kotlin.views.ComposeProps
import expo.modules.ui.UIComposableScope
import expo.modules.kotlin.views.FunctionalComposableScope
import expo.modules.ui.ModifierList
import expo.modules.ui.ModifierRegistry
import expo.modules.ui.composeOrNull
import expo.modules.ui.findChildSlotView
import expo.modules.kotlin.views.OptimizedComposeProps

@OptimizedRecord
class DropdownMenuItemColors : Record {
  @Field val textColor: Color? = null

  @Field val leadingIconColor: Color? = null

  @Field val trailingIconColor: Color? = null

  @Field val disabledTextColor: Color? = null

  @Field val disabledLeadingIconColor: Color? = null

  @Field val disabledTrailingIconColor: Color? = null
}

enum class DropdownMenuItemRole(val value: String) : Enumerable {
  DEFAULT("default"),
  DESTRUCTIVE("destructive")
}

@OptimizedComposeProps
data class DropdownMenuItemProps(
  val enabled: Boolean = true,
  val role: DropdownMenuItemRole = DropdownMenuItemRole.DEFAULT,
  val elementColors: DropdownMenuItemColors = DropdownMenuItemColors(),
  val modifiers: ModifierList = emptyList()
) : ComposeProps

@Composable
fun FunctionalComposableScope.DropdownMenuItemContent(
  props: DropdownMenuItemProps,
  onItemPressed: () -> Unit
) {
  val textSlotView = findChildSlotView(view, "text")
  val leadingSlotView = findChildSlotView(view, "leadingIcon")
  val trailingSlotView = findChildSlotView(view, "trailingIcon")

  val colors = props.elementColors
  val defaultColors = MenuDefaults.itemColors()
  val isDestructive = props.role == DropdownMenuItemRole.DESTRUCTIVE
  val errorColor = MaterialTheme.colorScheme.error
  val baseTextColor = if (isDestructive) errorColor else defaultColors.textColor
  val baseLeadingIconColor = if (isDestructive) errorColor else defaultColors.leadingIconColor

  DropdownMenuItem(
    text = { textSlotView?.let { with(UIComposableScope()) { with(it) { Content() } } } ?: Unit },
    enabled = props.enabled,
    modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher),
    colors = MenuDefaults.itemColors(
      textColor = colors.textColor.composeOrNull ?: baseTextColor,
      leadingIconColor = colors.leadingIconColor.composeOrNull ?: baseLeadingIconColor,
      trailingIconColor = colors.trailingIconColor.composeOrNull ?: defaultColors.trailingIconColor,
      disabledTextColor = colors.disabledTextColor.composeOrNull ?: defaultColors.disabledTextColor,
      disabledLeadingIconColor = colors.disabledLeadingIconColor.composeOrNull ?: defaultColors.disabledLeadingIconColor,
      disabledTrailingIconColor = colors.disabledTrailingIconColor.composeOrNull ?: defaultColors.disabledTrailingIconColor
    ),
    leadingIcon = leadingSlotView?.let {
      { with(UIComposableScope()) { with(it) { Content() } } }
    },
    trailingIcon = trailingSlotView?.let {
      { with(UIComposableScope()) { with(it) { Content() } } }
    },
    onClick = {
      onItemPressed()
    }
  )
}
