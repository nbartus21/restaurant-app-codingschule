import  { useState, useEffect } from 'react';
import { format, isBefore, startOfDay, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '../utils/api';

const tables = [
  { id: 1, seats: 2, position: [1, 1] },
  { id: 2, seats: 2, position: [1, 2] },
  { id: 3, seats: 4, position: [1, 3] },
  { id: 4, seats: 4, position: [1, 4] },
  { id: 5, seats: 6, position: [2, 1] },
  { id: 6, seats: 6, position: [2, 2] },
  { id: 7, seats: 8, position: [2, 3] },
  { id: 8, seats: 2, position: [2, 4] },
  { id: 9, seats: 2, position: [3, 1] },
  { id: 10, seats: 4, position: [3, 2] },
  { id: 11, seats: 4, position: [3, 3] },
  { id: 12, seats: 6, position: [3, 4] },
  { id: 13, seats: 4, position: [4, 1] },
  { id: 14, seats: 2, position: [4, 2] },
  { id: 15, seats: 8, position: [4, 3, 5 , 4] },
]

const ReservationModificationModal = ({ reservation, onModify, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(reservation.date));
  const [selectedTime, setSelectedTime] = useState(reservation.bookingTime);
  const [selectedTable, setSelectedTable] = useState(reservation.tableNumber);
  const [guests, setGuests] = useState(reservation.guestCount);
  const [reservations, setReservations] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    const timeSlots = [
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const currentDate = new Date();
    const isToday = selectedDate.toDateString() === currentDate.toDateString();

    if (isToday) {
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      setAvailableTimeSlots(timeSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
      }));
    } else {
      setAvailableTimeSlots(timeSlots);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const fetchBookedTables = async () => {
        try {
          const response = await api.get(`/reservations/booked?date=${selectedDate.toISOString()}&time=${selectedTime}`);
          console.log(response.data)
          if (response.status === 200) {
            setReservations(response.data);
          }
        } catch (error) {
          console.error("Error fetching booked tables:", error);
        }
      };
      fetchBookedTables();
    }
  }, [selectedDate, selectedTime]);

  const isTableAvailable = (tableId) => {
    return !reservations.some(
      res => res.tableNumber === tableId &&
             res.date === selectedDate.toDateString() &&
             res.bookingTime === selectedTime &&
             res._id !== reservation._id
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onModify(reservation._id, {
      date: selectedDate,
      bookingTime: selectedTime,
      tableNumber: selectedTable,
      guestCount: guests
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Modify Reservation</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, startOfDay(new Date())) || isBefore(date, addDays(new Date(), 1))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Guests</label>
              <Select value={guests.toString()} onValueChange={(value) => setGuests(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Number of guests" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Select a Table</label>
              <div className="relative w-full aspect-[4/3] border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100 mt-2">
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 p-4">
                  {tables.map((table) => (
                    <button
                      key={table.id}
                      type="button"
                      style={{
                        gridColumn: table.position[1],
                        gridRow: table.position[0],
                        gridColumnEnd: table.position[2],
                        gridRowEnd: table.position[3],
                      }}
                      className={`
                        rounded-lg
                        ${selectedTable === table.id
                          ? 'bg-blue-600 text-white'
                          : isTableAvailable(table.id)
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }
                        flex flex-col items-center justify-center font-bold transition-colors duration-300
                        ${table.seats > 6 ? 'text-lg' : 'text-base'}
                      `}
                      onClick={() => isTableAvailable(table.id) && setSelectedTable(table.id)}
                      disabled={!isTableAvailable(table.id)}
                    >
                      <span>{table.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedDate || !selectedTime || !selectedTable || guests < 1}
            >
              Modify Reservation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModificationModal;