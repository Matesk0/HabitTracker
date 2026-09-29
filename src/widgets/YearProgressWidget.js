import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function YearProgressWidget({
  currentYear = 2026,
  currentDayOfYear = 1,
  totalDaysInYear = 365,
  yearPercentage = 0,
  dateString = 'Jan 1',
  width = 240,
  height = 150,
}) {
  const safePercentage = Math.min(100, Math.max(0, yearPercentage));
  const padding = width < 180 ? 10 : 14;
  const headerFontSize = Math.max(12, Math.min(18, Math.round(width * 0.075)));

  const availWidth = Math.max(80, width - 2 * padding);
  const cols = width < 180 ? 19 : width < 260 ? 25 : 28;
  const totalRows = Math.ceil(totalDaysInYear / cols);
  const dotSize = Math.max(3, Math.min(8, Math.floor((availWidth - (cols - 1) * 2) / cols)));

  const days = Array.from({ length: totalDaysInYear }, (_, i) => ({
    dayNum: i + 1,
    isPassed: i + 1 <= currentDayOfYear,
  }));

  const rows = [];
  for (let i = 0; i < days.length; i += cols) {
    const chunk = days.slice(i, i + cols);
    while (chunk.length < cols) {
      chunk.push(null);
    }
    rows.push(chunk);
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
      clickAction="OPEN_APP"
    >
      {/* Top Header: Top Left Date, Top Right % */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text={dateString}
          style={{
            fontSize: headerFontSize,
            fontWeight: '700',
            color: '#ffffff',
          }}
        />
        <TextWidget
          text={`${safePercentage}%`}
          style={{
            fontSize: headerFontSize,
            fontWeight: '700',
            color: '#ffffff',
          }}
        />
      </FlexWidget>

      {/* Small balls filling up the year */}
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
              marginVertical: 1,
            }}
          >
            {row.map((day, dIdx) => (
              <FlexWidget
                key={dIdx}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: Math.floor(dotSize / 2),
                  backgroundColor: day
                    ? (day.isPassed ? '#ffffff' : 'rgba(255, 255, 255, 0.18)')
                    : 'transparent',
                }}
              />
            ))}
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
