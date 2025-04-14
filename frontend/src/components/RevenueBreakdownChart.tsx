import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { RevenueSegment } from '@/app/api/company/route';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface RevenueBreakdownChartProps {
  segments: RevenueSegment[];
}

export default function RevenueBreakdownChart({ segments }: RevenueBreakdownChartProps) {
  // Generate colors based on our palette
  const generateColors = (count: number) => {
    const baseColors = [
      '#D5FD51', // Neon Green (primary)
      '#4AF6C3', // Positive Green
      '#0068FF', // Interactive Blue
      '#FB8B1E', // Highlight Orange
      '#FF433D', // Negative Red
    ];
    
    // If we need more colors than in our base palette, generate variations
    const colors = [...baseColors];
    while (colors.length < count) {
      const baseColor = baseColors[colors.length % baseColors.length];
      // Create a slightly different shade
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      // Adjust brightness slightly for variation
      const factor = 0.8 + (colors.length * 0.05);
      const newColor = '#' + 
        Math.min(255, Math.floor(r * factor)).toString(16).padStart(2, '0') +
        Math.min(255, Math.floor(g * factor)).toString(16).padStart(2, '0') +
        Math.min(255, Math.floor(b * factor)).toString(16).padStart(2, '0');
      
      colors.push(newColor);
    }
    
    return colors.slice(0, count);
  };

  // Prepare chart data
  const chartData = {
    labels: segments.map(segment => `${segment.name} (${segment.percentage}%)`),
    datasets: [
      {
        data: segments.map(segment => segment.percentage),
        backgroundColor: generateColors(segments.length),
        borderColor: '#121212',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#F8F9FA',
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const segment = segments[context.dataIndex];
            return [
              `${segment.name}: ${segment.percentage}%`,
              segment.description,
              segment.amount ? `$${(segment.amount / 1000000000).toFixed(1)}B` : '',
            ].filter(Boolean);
          }
        }
      }
    },
    cutout: '60%',
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
