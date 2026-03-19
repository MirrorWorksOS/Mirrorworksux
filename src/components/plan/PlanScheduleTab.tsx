import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List, Grid, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

type ViewMode = 'gantt' | 'calendar';
type FilterMode = 'all' | 'done' | 'pending';

const OPERATIONS = [
  { id: 1, name: 'Prepare BOM', days: [2, 3], color: 'bg-[#36B37E]', status: 'done' },
  { id: 2, name: 'Prepare NC files', days: [4, 5], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 3, name: 'Laser Cutting', days: [7, 8, 9], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 4, name: 'Deburr Cut Parts', days: [8, 9, 10, 11, 12], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 5, name: 'Bend Panels on Press Brake', days: [13, 14], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 6, name: 'Spot Welding of Internal Brackets', days: [7, 8, 9], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 7, name: 'Surface Preparation Before Coating', days: [9, 10], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 8, name: 'Apply Powder Coating and Bake', days: [10, 11], color: 'bg-[#FFCF4B]', status: 'pending' },
  { id: 9, name: 'QC', days: [12, 13, 14], color: 'bg-[#FF8B00]', status: 'pending' }
];

export function PlanScheduleTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [currentMonth, setCurrentMonth] = useState('April 2026');
  const [currentDay, setCurrentDay] = useState(6);

  const filteredOperations = OPERATIONS.filter(op => {
    if (filterMode === 'all') return true;
    return op.status === filterMode;
  });

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Toolbar */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mr-4">
              Schedule
            </h2>
            <Button
              variant={filterMode === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('all')}
              className={cn(
                'h-8 text-xs',
                filterMode === 'all' 
                  ? 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]' 
                  : 'text-[#737373]'
              )}
            >
              All
            </Button>
            <Button
              variant={filterMode === 'done' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('done')}
              className={cn(
                'h-8 text-xs',
                filterMode === 'done' 
                  ? 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]' 
                  : 'text-[#737373]'
              )}
            >
              Done
            </Button>
            <Button
              variant={filterMode === 'pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterMode('pending')}
              className={cn(
                'h-8 text-xs',
                filterMode === 'pending' 
                  ? 'bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]' 
                  : 'text-[#737373]'
              )}
            >
              Pending
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[#E5E5E5] rounded-lg p-1">
              <button
                onClick={() => setViewMode('gantt')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'gantt' ? 'bg-[#F5F5F5]' : 'hover:bg-[#FAFAFA]'
                )}
              >
                <List className="w-4 h-4 text-[#0A0A0A]" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'calendar' ? 'bg-[#F5F5F5]' : 'hover:bg-[#FAFAFA]'
                )}
              >
                <Calendar className="w-4 h-4 text-[#0A0A0A]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <button className="p-1 hover:bg-[#E5E5E5] rounded transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#0A0A0A]" />
              </button>
              <span className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A]">
                {currentMonth}
              </span>
              <button className="p-1 hover:bg-[#E5E5E5] rounded transition-colors">
                <ChevronRight className="w-5 h-5 text-[#0A0A0A]" />
              </button>
            </div>

            {/* Gantt Chart */}
            <div className="flex">
              {/* Operations Column */}
              <div className="w-64 flex-shrink-0 border-r border-[#E5E5E5]">
                <div className="px-4 py-3 bg-[#F5F5F5] border-b border-[#E5E5E5]">
                  <span className="font-['Geist:Medium',sans-serif] text-[13px] font-medium text-[#0A0A0A]">
                    Operations ({filteredOperations.length} tasks)
                  </span>
                </div>
                <div>
                  {filteredOperations.map((operation) => (
                    <div
                      key={operation.id}
                      className="px-4 py-3 border-b border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors"
                    >
                      <span className="font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">
                        {operation.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Grid */}
              <div className="flex-1 overflow-x-auto">
                {/* Day Headers */}
                <div className="flex bg-[#F5F5F5] border-b border-[#E5E5E5] sticky top-0">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={cn(
                        'flex-shrink-0 w-12 py-3 text-center border-r border-[#E5E5E5]',
                        day === currentDay && 'bg-[#FFCF4B]'
                      )}
                    >
                      <span
                        className={cn(
                          'font-[\'Geist:Medium\',sans-serif] text-[12px] font-medium',
                          day === currentDay ? 'text-[#2C2C2C]' : 'text-[#737373]'
                        )}
                      >
                        {day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Timeline Bars */}
                <div>
                  {filteredOperations.map((operation) => (
                    <div
                      key={operation.id}
                      className="flex border-b border-[#E5E5E5] py-3"
                      style={{ height: '52px' }}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((day) => {
                        const isInRange = operation.days.includes(day);
                        const isStart = operation.days[0] === day;
                        const isEnd = operation.days[operation.days.length - 1] === day;
                        
                        return (
                          <div
                            key={day}
                            className="flex-shrink-0 w-12 px-1 border-r border-[#E5E5E5]"
                          >
                            {isInRange && (
                              <div
                                className={cn(
                                  'h-6 transition-all',
                                  operation.color,
                                  isStart && 'rounded-l',
                                  isEnd && 'rounded-r'
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#0A0A0A]" />
              </button>
              <h3 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">
                {currentMonth}
              </h3>
              <button className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
                <ChevronRight className="w-5 h-5 text-[#0A0A0A]" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className="text-center font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] pb-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const hasEvents = [2, 3, 7, 8, 9, 10, 11, 12, 13, 14].includes(day);
                
                return (
                  <div
                    key={day}
                    className={cn(
                      'min-h-[100px] border border-[#E5E5E5] rounded-lg p-2 transition-colors',
                      day === currentDay && 'bg-[#FFFBF0] border-[#FFCF4B]',
                      hasEvents && day !== currentDay && 'bg-[#FAFAFA]',
                      'hover:bg-[#F5F5F5] cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          'font-[\'Geist:Medium\',sans-serif] text-[13px]',
                          day === currentDay ? 'font-semibold text-[#0A0A0A]' : 'text-[#737373]'
                        )}
                      >
                        {day}
                      </span>
                    </div>

                    {hasEvents && (
                      <div className="space-y-1">
                        {day >= 2 && day <= 3 && (
                          <div className="bg-[#36B37E] rounded px-2 py-1">
                            <p className="font-['Geist:Regular',sans-serif] text-[10px] text-white truncate">
                              Prepare BOM
                            </p>
                          </div>
                        )}
                        {day >= 7 && day <= 9 && (
                          <div className="bg-[#FFCF4B] rounded px-2 py-1">
                            <p className="font-['Geist:Regular',sans-serif] text-[10px] text-[#2C2C2C] truncate">
                              Laser Cutting
                            </p>
                          </div>
                        )}
                        {day >= 8 && day <= 12 && (
                          <div className="bg-[#FFCF4B] rounded px-2 py-1">
                            <p className="font-['Geist:Regular',sans-serif] text-[10px] text-[#2C2C2C] truncate">
                              Deburr Parts
                            </p>
                          </div>
                        )}
                        {day >= 13 && day <= 14 && (
                          <div className="bg-[#FFCF4B] rounded px-2 py-1">
                            <p className="font-['Geist:Regular',sans-serif] text-[10px] text-[#2C2C2C] truncate">
                              Press Brake
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}