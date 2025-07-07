import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Insights = () => {
  // Mock Data
  const moodData = {
    labels: ['May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Happiness %',
      data: [60, 68, 80],
      borderColor: '#f06292',
      backgroundColor: 'rgba(240, 98, 146, 0.2)',
      fill: true,
    }],
  };

  const emotionData = {
    labels: ['Calm', 'Happy', 'Anxious', 'Sad'],
    datasets: [{
      data: [40, 35, 15, 10],
      backgroundColor: ['#f8bbd0', '#f06292', '#ad1457', '#e57373'],
      borderColor: ['#fff'],
      borderWidth: 1,
    }],
  };

  const morningVsEveningData = {
    labels: ['Morning', 'Evening'],
    datasets: [{
      label: 'Anxiety %',
      data: [10, 25],
      backgroundColor: '#f06292',
    }],
  };

  const weekdayVsWeekendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Happiness %',
      data: [50, 55, 60, 65, 70, 85, 75],
      backgroundColor: '#f8bbd0',
    }],
  };

  const streakData = 8;
  const gratitudeCount = 25;
  const positivityRatio = 75; // 0-100 scale
  const sleepData = {
    labels: ['<6h', '6-7h', '7-8h', '>8h'],
    datasets: [{
      label: 'Happiness %',
      data: [50, 60, 70, 80],
      backgroundColor: '#f06292',
    }],
  };

  const wordCloudData = ['friends', 'nature', 'music', 'partner', 'family'];

  return (
    <>
    </>
  );
};

export default Insights;