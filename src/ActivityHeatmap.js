// src/components/ActivityHeatmap.js

import React, { useMemo } from 'react';
import './ActivityHeatmap.css';

const ActivityHeatmap = ({ data, theme = 'pink' }) => {
  const colorThemes = {
    green: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
    pink: ['#fde2f3', '#f9a8d4', 'rgba(244, 114, 182, 0.8)', '#ec4899', '#db2777'],
  };

  const colors = colorThemes[theme] || colorThemes.green;

  const getColor = (count) => {
    if (count <= 0) return colors[0];
    if (count < 2) return colors[1];
    if (count < 5) return colors[2];
    if (count < 10) return colors[3];
    return colors[4];
  };

  const { cells, monthLabels } = useMemo(() => {
    const today = new Date();
    const cells = [];
    const monthData = [];
    const daysToShow = 365; // Show a full year

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToShow);
    
    let currentWeek = 0;
    
    // Add placeholder days to align the start of the year to the correct weekday
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ date: null, count: -1 });
    }

    let lastMonth = -1;

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 && i > 0) {
        currentWeek++;
      }
      
      const currentMonth = currentDate.getMonth();
      if (currentMonth !== lastMonth) {
        monthData.push({
          month: currentDate.toLocaleString('default', { month: 'short' }),
          colIndex: currentWeek,
        });
        lastMonth = currentMonth;
      }
      
      cells.push({
        date: dateStr,
        count: data[dateStr] || 0,
      });
    }

    return { cells, monthLabels: monthData };
  }, [data]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`heatmap-container theme-${theme}`}>
      <div className="heatmap-months">
        {monthLabels.map(({ month, colIndex }) => (
          <div key={month} className="heatmap-month" style={{ gridColumnStart: colIndex + 1 }}>
            {month}
          </div>
        ))}
      </div>
      <div className="heatmap-body">
        <div className="heatmap-weekdays">
          {weekdays.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="heatmap-grid">
          {cells.map((cell, index) => (
            <div
              key={index}
              className="heatmap-cell"
              style={{ backgroundColor: getColor(cell.count) }}
              data-date={cell.date}
            >
              {cell.date && (
                <div className="heatmap-tooltip">
                  <strong>{cell.count || 'No'} entries</strong> on {cell.date}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
