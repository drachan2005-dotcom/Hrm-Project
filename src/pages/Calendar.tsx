import { ChevronLeft, ChevronRight, Settings, HelpCircle } from 'lucide-react';
import { mockCalendarEvents } from '../data/mockData';
import { useState } from 'react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 9));
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Day');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }

    return week;
  };

  const getEventsForDate = (date: Date) => {
    return mockCalendarEvents.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => viewMode === 'Month' ? navigateMonth(-1) : navigateDay(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => viewMode === 'Month' ? navigateMonth(1) : navigateDay(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['Day', 'Week', 'Month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {viewMode === 'Day' && (
          <div className="p-6">
            <div className="mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">GMT +7</p>
                <div className="flex justify-center items-baseline space-x-2 mt-1">
                  <span className="text-5xl font-bold text-gray-800">
                    {currentDate.getDate().toString().padStart(2, '0')}
                  </span>
                  <div className="text-left">
                    <p className="text-lg font-medium text-gray-600">{daysOfWeek[currentDate.getDay()]}</p>
                    <p className="text-sm text-gray-500">{monthNames[currentDate.getMonth()]}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-4">
              <div className="text-xs text-gray-500 space-y-16 pt-8">
                <div>8 am</div>
                <div>9 am</div>
                <div>10 am</div>
                <div>11 am</div>
                <div>12 pm</div>
              </div>

              {getWeekDays(currentDate).map((day, index) => (
                <div key={index} className="relative">
                  <div className="text-center mb-2 pb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500">{daysOfWeek[day.getDay()]}</p>
                    <p className={`text-lg font-semibold ${
                      isToday(day) ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {day.getDate()}
                    </p>
                  </div>
                  <div className="relative h-96">
                    {getEventsForDate(day).map((event, idx) => (
                      <div
                        key={event.id}
                        className="absolute left-0 right-0 px-2 py-1 rounded-lg text-xs"
                        style={{
                          backgroundColor: event.color,
                          top: `${idx * 25}%`,
                          height: '20%'
                        }}
                      >
                        <p className="font-medium text-gray-800 truncate">{event.title}</p>
                        <p className="text-gray-600 text-xs">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'Month' && (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {daysOfWeek.map((day) => (
                <div key={day} className="bg-gray-50 p-3 text-center">
                  <span className="text-sm font-semibold text-gray-600">{day}</span>
                </div>
              ))}
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`bg-white p-3 min-h-24 ${
                    !day ? 'bg-gray-50' : ''
                  } ${isToday(day) ? 'bg-blue-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-semibold mb-2 ${
                        isToday(day) ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {getEventsForDate(day).slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs px-2 py-1 rounded truncate"
                            style={{ backgroundColor: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {getEventsForDate(day).length > 2 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{getEventsForDate(day).length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
