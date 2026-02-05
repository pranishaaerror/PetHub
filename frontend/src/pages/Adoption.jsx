import React, { useState } from 'react';

export const Adoption = () => {
  const [pets] = useState([
    {
      
      name: 'Bella',
      breed: 'Golden Retriever',
      age: '2 Yrs',
      gender: 'Female',
      intakeDate: 'Oct 24, 2023',
      status: 'Available'
    },
    {
      
      name: 'Luna',
      breed: 'Siamese Mix',
      age: '8 Mos',
      gender: 'Female',
      intakeDate: 'Nov 02, 2023',
      status: 'Pending'
    },
    {
     
      name: 'Charlie',
      breed: 'Mixed Breed',
      age: '5 Mos',
      gender: 'Male',
      intakeDate: 'Nov 10, 2023',
      status: 'Available'
    }
  ]);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-surface-dark/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Pet Details
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Breed & Species
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Age/Gender
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Intake Date
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-surface-dark divide-y divide-slate-200 dark:divide-slate-800">
            {pets.map((pet) => (
              <tr
                key={pet.id}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 relative">
                      
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{pet.name}</div>
                    
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">{pet.breed}</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mt-1">
                   
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">{pet.age}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{pet.gender}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {pet.intakeDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {pet.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-slate-400 hover:text-green-600 dark:hover:text-green-500 transition-colors">
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};