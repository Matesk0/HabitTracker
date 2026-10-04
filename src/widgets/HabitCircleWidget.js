import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitCircleWidget({
  habitId = 'default',
  habitName = 'Habit',
  isDone = false,
  width = 100,
  height = 100,
}) {
  const minDim = Math.min(width, height);
  const outerSize = Math.max(36, Math.min(68, Math.round(minDim * 0.52)));
  const innerSize = Math.max(16, Math.min(36, Math.round(outerSize * 0.52)));
  const nameFontSize = Math.max(11, Math.min(15, Math.round(minDim * 0.12)));

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1c1c1e',
        borderRadius: 22,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="TOGGLE_TODAY"
      clickActionData={{ habitId }}
    >
      {/* Habit Name at Top */}
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

      {/* Concentric Circle (matching small-habit.png) */}
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
            width: outerSize,
            height: outerSize,
            borderRadius: Math.floor(outerSize / 2),
            borderWidth: isDone ? 3.5 : 2.5,
            borderColor: isDone ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDone ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
          }}
        >
          {isDone ? (
            <FlexWidget
              style={{
                width: innerSize,
                height: innerSize,
                borderRadius: Math.floor(innerSize / 2),
                backgroundColor: '#ffffff',
              }}
            />
          ) : (
            <FlexWidget
              style={{
                width: innerSize,
                height: innerSize,
                borderRadius: Math.floor(innerSize / 2),
                borderWidth: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
          )}
        </FlexWidget>
      </FlexWidget>

      {/* Subtle Status Label */}
      <TextWidget
        text={isDone ? 'Done' : 'Tap'}
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: isDone ? '#ffffff' : '#8e8e93',
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}
