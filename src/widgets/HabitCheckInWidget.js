import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitCheckInWidget({
  habitId = 'default',
  habitName = 'Habit',
  isDone = false,
  width = 110,
  height = 110,
}) {
  const padding = width < 120 ? 10 : 14;
  const nameFontSize = Math.max(12, Math.min(16, Math.round(width * 0.1)));
  const dotSize = Math.max(24, Math.min(48, Math.round(Math.min(width, height) * 0.36)));
  const dotRadius = Math.floor(dotSize / 2);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1c1c1e',
        borderRadius: 22,
        padding: padding,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="TOGGLE_TODAY"
      clickActionData={{ habitId }}
    >
      {/* Small name at the top */}
      <TextWidget
        text={habitName}
        style={{
          fontSize: nameFontSize,
          fontWeight: '700',
          color: '#ffffff',
          textAlign: 'center',
        }}
        maxLines={1}
        truncate="END"
      />

      {/* Center checkmark dot (white when done, grey when not) */}
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <FlexWidget
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotRadius,
            backgroundColor: isDone ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
            borderWidth: isDone ? 0 : 2,
            borderColor: 'rgba(255, 255, 255, 0.28)',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
