import React, { useState } from 'react';
import { Search, ChevronDown, Eye, Trash2 } from 'lucide-react';
import Sidebar from '../Components/Sidebar';

function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Country');

  const users = [
    {
      id: 1,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      name: 'Jane Cooper',
      email: 'jane.mcnerney44@gmail.com',
      country: 'Spain',
      joinDate: 'November 20, 2020',
      location: 'Madrid',
      status: 'active'
    },
    {
      id: 2,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      name: 'Daniel Lowe',
      email: 'daniel.mcnerney44@gmail.com',
      country: 'Spain',
      joinDate: 'November 16, 2022',
      location: 'Barcelona',
      status: 'active'
    }
  ];

  const countries = ['Country', 'Spain', 'France', 'Germany', 'Italy', 'Portugal'];

  const handleView = (userId) => {
    console.log(`View user ${userId}`);
  };

  const handleDelete = (userId) => {
    console.log(`Delete user ${userId}`);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    
    <div className="bg-white flex gap-10 ">
        <Sidebar/>
        <div>
      {/* Header */}
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Users Management</h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Country Filter */}
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Country</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* User Avatar and Name */}
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                
                {/* Email */}
                <td className="py-4 px-4 text-gray-600">
                  {user.email}
                </td>
                
                {/* Country with Status Dot */}
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{user.country}</span>
                  </div>
                </td>
                
                {/* Join Date */}
                <td className="py-4 px-4 text-gray-600">
                  {user.joinDate}
                </td>
                
                {/* Location */}
                <td className="py-4 px-4 text-gray-700">
                  {user.location}
                </td>
                
                {/* Actions */}
                <td className="py-4 px-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleView(user.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found matching your search criteria.</p>
        </div>
      )}
    </div>
    </div>
  );
}

export default UsersManagement;