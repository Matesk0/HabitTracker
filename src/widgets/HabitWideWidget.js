import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitWideWidget({
  habitId = 'default',
  habitName = 'Habit',
  isDone = false,
  streak = 0,
  width = 220,
  height = 70,
}) {
  const paddingH = width < 180 ? 12 : 16;
  const circleSize = Math.max(24, Math.min(34, Math.round(height * 0.48)));
  const circleRadius = Math.floor(circleSize / 2);
  const innerDotSize = Math.max(12, Math.round(circleSize * 0.5));
  const innerDotRadius = Math.floor(innerDotSize / 2);
  const nameFontSize = Math.max(13, Math.min(17, Math.round(width * 0.065)));

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1c1c1e',
        borderRadius: 999,
        paddingHorizontal: paddingH,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: isDone ? '#ffffff' : 'rgba(255, 255, 255, 0.28)',
      }}
      clickAction="TOGGLE_TODAY"
      clickActionData={{ habitId }}
    >
      {/* Left: Checkmark / Concentric Circle (matching wide-habit.png) */}
      <FlexWidget
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleRadius,
          borderWidth: 2,
          borderColor: isDone ? '#ffffff' : 'rgba(255, 255, 255, 0.55)',
          backgroundColor: isDone ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        {isDone ? (
          <FlexWidget
            style={{
              width: innerDotSize,
              height: innerDotSize,
              borderRadius: innerDotRadius,
              backgroundColor: '#ffffff',
            }}
          />
        ) : null}
      </FlexWidget>

      {/* Center: Habit Name ("Text for habit" from wide-habit.png) */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={habitName}
          style={{
            fontSize: nameFontSize,
            fontWeight: '700',
            color: '#ffffff',
          }}
          maxLines={1}
          truncate="END"
        />
      </FlexWidget>

      {/* Right: Streak badge */}
      {streak > 0 && (
        <FlexWidget
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            marginLeft: 8,
          }}
        >
          <TextWidget
            text={`${streak}d`}
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: '#8e8e93',
            }}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
