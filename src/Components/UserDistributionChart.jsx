
import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";

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
          <h2 className="text-lg font-semibold text-black">User Distribution</h2>
        </div>
        <button 
          onClick={handleMoreOptions}
          className="text-black "
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col  space-y-1">
            <h3 className="sm:text-2xl text-sm font-medium text-black">New Users</h3>
            <span className="text-base font-semibold text-black">70%</span>
          </div>
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
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#8C8C8C]">
            <span>100%</span>
            <span>80%</span>
            <span>60%</span>
            <span>30%</span>
            <span>10%</span>
          </div>
          
          {/* Chart Container */}
          <div className="ml-8 h-full relative">
            {/* Chart SVG */}
            <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4BADE6" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#4BADE6" stopOpacity="0.1"/>
                </linearGradient>
              </defs>
              
              {/* Chart Area Fill */}
              <path
                d="M 0 80 Q 150 85 300 120 Q 450 115 600 90 Q 750 50 900 55 Q 1050 80 1200 90 L 1200 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Chart Line */}
              <path
                d="M 0 80 Q 150 85 300 120 Q 450 115 600 90 Q 750 50 900 55 Q 1050 80 1200 90"
                stroke="#4BADE6"
                strokeWidth="2.5"
                fill="none"
              />
              
              {/* Prominent Data Point in March area with vertical line */}
              <circle cx="300" cy="120" r="7" fill="#4BADE6"  stroke="white" strokeWidth="2" />
              {/* Vertical line from March point */}
              <line x1="300" y1="120" x2="300" y2="200"  stroke="#4BADE6" strokeWidth="20" opacity="0.8" />
            </svg>
            
            {/* X-axis Labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-[#8C8C8C]">
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
      </div>
    </div>
  );
}

export default UserDistributionChart;