import React, { useState } from "react";
import { BarChart3, MoreHorizontal } from "lucide-react";

function UserDistributionChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("Day");
  const [selectedMonth, setSelectedMonth] = useState("Month");
  const [selectedYear, setSelectedYear] = useState("Year");

  const handleMoreOptions = () => {
    console.log("More options clicked");
    // Add more options logic here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
        </div>
        <button 
          onClick={handleMoreOptions}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-900">New Users</h3>
          <div className="flex space-x-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Day</option>
              <option>Week</option>
            </select>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Month</option>
              <option>Quarter</option>
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Year</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative h-64">
          {/* Y-axis Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
            <span>100%</span>
            <span>80%</span>
            <span>60%</span>
            <span>30%</span>
            <span>10%</span>
          </div>
          
          {/* Chart Container */}
          <div className="ml-8 h-full relative">
            {/* Chart Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-50 rounded-t-lg opacity-50"></div>
            
            {/* Chart SVG */}
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              
              {/* Chart Area Fill */}
              <path
                d="M 0 80 Q 100 75 200 85 T 400 70 T 600 75 T 800 80 L 800 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Chart Line */}
              <path
                d="M 0 80 Q 100 75 200 85 T 400 70 T 600 75 T 800 80"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
              />
              
              {/* Data Points */}
              <circle cx="200" cy="85" r="4" fill="#3B82F6" />
              <circle cx="400" cy="70" r="4" fill="#3B82F6" />
              <circle cx="600" cy="75" r="4" fill="#3B82F6" />
            </svg>
            
            {/* X-axis Labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>July</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Chart Stats */}
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-1">70%</p>
          <p className="text-sm text-gray-500">Average user growth this period</p>
        </div>
      </div>
    </div>
  );
}

export default UserDistributionChart;