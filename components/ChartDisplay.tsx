import React, { useEffect, useRef } from 'react';
import { ChartData } from '../types';

declare const Chart: any;

interface ChartDisplayProps {
    chartData: ChartData;
    theme: 'light' | 'dark' | 'rockstar';
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartData, theme }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current || !chartData || typeof Chart === 'undefined') {
            return;
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        const chartColors = {
            light: {
                grid: 'rgba(0, 0, 0, 0.08)',
                ticks: '#3d3d3d', // neutral-600
                title: '#121212', // neutral-900
                legend: '#3d3d3d', // neutral-600
                tooltipBg: 'rgba(255, 255, 255, 0.9)',
                tooltipTitle: '#121212',
                tooltipBody: '#3d3d3d',
                tooltipBorder: '#e5e5e5',
                datasetBg: 'rgba(59, 130, 246, 0.6)',
                datasetBorder: 'rgba(59, 130, 246, 1)',
                datasetHover: 'rgba(59, 130, 246, 0.8)',
            },
            dark: {
                grid: 'rgba(255, 255, 255, 0.1)',
                ticks: '#a3a3a3', // neutral-400
                title: '#f5f5f5', // neutral-100
                legend: '#d4d4d4', // neutral-300
                tooltipBg: 'rgba(31, 31, 31, 0.9)',
                tooltipTitle: '#f5f5f5',
                tooltipBody: '#d4d4d4',
                tooltipBorder: '#2e2e2e',
                datasetBg: 'rgba(96, 165, 250, 0.5)',
                datasetBorder: 'rgba(96, 165, 250, 1)',
                datasetHover: 'rgba(96, 165, 250, 0.8)',
            },
            rockstar: {
                grid: 'rgba(255, 255, 255, 0.15)',
                ticks: '#a3a3a3',
                title: '#f5f5f5',
                legend: '#d4d4d4',
                tooltipBg: 'rgba(10, 10, 10, 0.9)',
                tooltipTitle: '#f5f5f5',
                tooltipBody: '#d4d4d4',
                tooltipBorder: '#c026d3', // rockstar-purple
                datasetBg: 'rgba(236, 72, 153, 0.6)',
                datasetBorder: 'rgba(244, 114, 182, 1)',
                datasetHover: 'rgba(236, 72, 153, 0.9)',
            }
        };

        const currentColors = chartColors[theme];

        const chartConfig = {
            type: chartData.type || 'bar',
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets.map(ds => ({
                    ...ds,
                    backgroundColor: currentColors.datasetBg,
                    borderColor: currentColors.datasetBorder,
                    borderWidth: 1.5,
                    borderRadius: 4,
                    hoverBackgroundColor: currentColors.datasetHover,
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: chartData.datasets.length > 1, 
                        labels: { color: currentColors.legend } 
                    },
                    title: { 
                        display: true, 
                        text: chartData.title, 
                        color: currentColors.title,
                        font: { size: 18, family: 'Inter, sans-serif' } 
                    },
                    tooltip: {
                        backgroundColor: currentColors.tooltipBg,
                        titleColor: currentColors.tooltipTitle,
                        bodyColor: currentColors.tooltipBody,
                        borderColor: currentColors.tooltipBorder,
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 4,
                        bodyFont: { family: 'Inter, sans-serif' },
                        titleFont: { family: 'Inter, sans-serif', weight: 'bold' },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: currentColors.grid },
                        ticks: { color: currentColors.ticks, font: { family: 'Inter, sans-serif' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: currentColors.ticks, font: { family: 'Inter, sans-serif' } }
                    }
                }
            }
        };
        
        chartInstanceRef.current = new Chart(ctx, chartConfig);

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData, theme]);

    return (
        <div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Visual Insights</h3>
            <div className="bg-white dark:bg-neutral-900/40 rockstar:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 rockstar:border-neutral-800/80 rounded-xl p-4 h-96 relative">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};