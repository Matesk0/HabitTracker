import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function Habit30DayWidget({
  habitId = 'default',
  habitName = 'Habit',
  past30Days = [],
  percentage = 0,
  width = 250,
  height = 110,
}) {
  const padding = width < 180 ? 10 : 14;
  const headerFontSize = Math.max(13, Math.min(18, Math.round(width * 0.075)));
  const availWidth = Math.max(80, width - 2 * padding);
  const cols = width < 150 ? 6 : 10;
  const dotSize = Math.max(8, Math.min(16, Math.floor((availWidth - (cols - 1) * 6) / cols)));
  const dotRadius = Math.floor(dotSize / 2);

  const rows = [];
  for (let i = 0; i < past30Days.length; i += cols) {
    rows.push(past30Days.slice(i, i + cols));
  }

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
      }}
      clickAction="TOGGLE_TODAY"
      clickActionData={{ habitId }}
    >
      {/* Header: Name at top left, % at top right */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text={habitName}
          style={{
            fontSize: headerFontSize,
            fontWeight: '700',
            color: '#ffffff',
          }}
          maxLines={1}
          truncate="END"
        />
        <TextWidget
          text={`${percentage}%`}
          style={{
            fontSize: headerFontSize,
            fontWeight: '700',
            color: '#ffffff',
          }}
        />
      </FlexWidget>

      {/* 30-Day Dot Matrix */}
      <FlexWidget
        style={{
          flexDirection: 'column',
          width: 'match_parent',
          justifyContent: 'center',
          flex: 1,
          marginTop: 6,
        }}
      >
        {rows.map((row, rIdx) => (
          <FlexWidget
            key={rIdx}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: 'match_parent',
              marginVertical: 2,
            }}
          >
            {row.map((dot) => (
              <FlexWidget
                key={dot.key}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotRadius,
                  backgroundColor: dot.isDone ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
                  ...(dot.isToday
                    ? {
                        borderWidth: 2,
                        borderColor: '#0a84ff',
                      }
                    : {}),
                }}
              />
            ))}
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
