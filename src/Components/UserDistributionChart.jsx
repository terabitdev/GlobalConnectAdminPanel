import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

function UserDistributionChart() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyUserData, setMonthlyUserData] = useState({});

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Get number of days in selected month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  // Get array of years from 1970 to current year + 10
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1970; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  // Update selected day if it exceeds days in month
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear]);

  const handleMoreOptions = () => {
    console.log("More options clicked");
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      console.log("Starting to fetch user data for year:", selectedYear);

      const usersRef = collection(db, "users");
      
      // Get all users with role="user"
      const roleQuery = query(
        usersRef,
        where("role", "==", "user")
      );
      
      const usersSnapshot = await getDocs(roleQuery);
      console.log("Total users with role 'user':", usersSnapshot.size);

      // Process users and group by month
      const monthlyData = {};
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.createdAt) {
          const date = new Date(userData.createdAt);
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        }
      });

      console.log("Monthly user data:", monthlyData);
      setMonthlyUserData(monthlyData);
      
      updateChartData(monthlyData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  // Update chart data based on selected year and month
  const updateChartData = (data) => {
    const newChartData = months.map((month, index) => {
      const monthYear = `${selectedYear}-${(index + 1).toString().padStart(2, "0")}`;
      const value = data[monthYear] || 0;
      return {
        month: month,
        value: value,
        percentage: 0,
        isSelected: (index + 1) === selectedMonth
      };
    });

    // Calculate percentages
    const maxValue = Math.max(...newChartData.map((d) => d.value), 1);
    newChartData.forEach((data) => {
      data.percentage = (data.value / maxValue) * 100;
    });

    setChartData(newChartData);
  };

  // Calculate growth percentage
  const getGrowthPercentage = () => {
    if (!chartData.length) return 0;
    const currentMonthData = chartData[selectedMonth - 1];
    const prevMonthData = chartData[selectedMonth - 2] || chartData[11];
    
    if (!currentMonthData || !prevMonthData) return 0;
    if (prevMonthData.value === 0) return currentMonthData.value > 0 ? 100 : 0;
    
    return Math.round(((currentMonthData.value - prevMonthData.value) / prevMonthData.value) * 100);
  };

  useEffect(() => {
    fetchUserData();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-black">User Distribution</h2>
        </div>
        <button 
          onClick={handleMoreOptions}
          className="text-black"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col space-y-1">
            <h3 className="sm:text-2xl text-sm font-medium text-black">New Users</h3>
            <div className="flex items-center space-x-2">
              <span className="text-base font-semibold text-black">
                {isLoading ? "Loading..." : `${chartData[selectedMonth - 1]?.value || 0} Users`}
              </span>
              <span className={`text-sm ${getGrowthPercentage() > 0 ? 'text-green-500' : getGrowthPercentage() < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                ({getGrowthPercentage() > 0 ? '+' : ''}{getGrowthPercentage()}%)
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <select 
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getYearRange().map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-80 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4BADE6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4BADE6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#9ca3af" }}
                  dy={10}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[20, 40, 60, 80, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: "#9ca3af" }}
                  tickFormatter={(value) => `${value}%`}
                  dx={-10}
                />

                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4BADE6"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={false}
                />

                {chartData.map(
                  (point, index) =>
                    point.isSelected && (
                      <ReferenceDot
                        key={index}
                        x={point.month}
                        y={point.percentage}
                        r={6}
                        fill="#4BADE6"
                        stroke="#ffffff"
                        strokeWidth={3}
                      />
                    )
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">No data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDistributionChart;