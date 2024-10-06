import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, isBefore, startOfDay } from 'date-fns'
import { Calendar as CalendarIcon, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import api from '@/utils/api'
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

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


export default function EnhancedReservationPage() {
  const [selectedDate, setSelectedDate] = useState(undefined)
  const [selectedTime, setSelectedTime] = useState(undefined)
  const [selectedTable, setSelectedTable] = useState(null)
  const [guests, setGuests] = useState(2)
  const [reservations, setReservations] = useState([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
   if(selectedDate && selectedTime){
    const fetchBookedTables = async () => {
      const response = await api.get(`http://localhost:8080/api/reservations/booked?date=${selectedDate}&time=${selectedTime}`)
      if (response.status === 200) {
        if(response.data.length > 0){
         const bookedTables = response.data.map((reservation) => {
          return {table : reservation.tableNumber , date : reservation.date , time : reservation.bookingTime}
         })
         setReservations(bookedTables)
        }
      }
    }
    fetchBookedTables()
   }
  }, [selectedDate , selectedTime])


  useEffect(() => {
    const timeSlots = [
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ]
    if (selectedDate) {
      const currentDate = new Date()
      const isToday = selectedDate.toDateString() === currentDate.toDateString()

      if (isToday) {
        const currentHour = currentDate.getHours()
        const currentMinute = currentDate.getMinutes()
        setAvailableTimeSlots(timeSlots.filter(slot => {
          const [slotHour, slotMinute] = slot.split(':').map(Number)
          return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute)
        }))
      } else {
        setAvailableTimeSlots(timeSlots)
      }
    }
  }, [selectedDate])

  useEffect(() => {
    // Unselect table when date or time changes
    setSelectedTable(null)
  }, [selectedDate, selectedTime])

  const isTableAvailable = (tableId) => {
    return !reservations.some(
      res => res.table === tableId &&
             res.date === selectedDate?.toDateString() &&
             res.time === selectedTime
    )
  }

const handleReservation = async () => {
  if (selectedTable && selectedDate && selectedTime) {
    try {
      const response = await api.post('http://localhost:8080/api/reservations/create-checkout-session', {
        tableNumber: selectedTable,
        date: selectedDate,
        bookingTime: selectedTime,
        guestCount: guests
      });

      if (response.data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        await stripe.redirectToCheckout({
          sessionId: response.data.sessionId
        });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      if (error.response && error.response.status === 401) {
        // User is unauthorized, redirect to login page
        navigate('/login');
        toast({
          title: "Authentication Required",
          description: "Please log in to make a reservation.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reservation Failed",
          description: "An error occurred while creating the reservation.",
          variant: "destructive",
        });
      }
    }
  }
};


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-gray-900 mb-8"
        >
          Reserve Your Table
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Date & Time</h2>
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
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
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select onValueChange={setSelectedTime}>
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

              <Select onValueChange={(value) => setGuests(Number(value))}>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-lg shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Select a Table</h2>
            <div className="relative w-full aspect-[4/3] border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100">
              {(!selectedDate || !selectedTime) && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-10">
                  <p className="text-gray-600 text-lg font-semibold">Please select a date and time first</p>
                </div>
              )}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 p-4">
                {tables.map((table) => (
                  <motion.button
                    key={table.id}
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!selectedDate || !selectedTime}
                  >
                    <span>{table.id}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
              <p>Blue: Selected | Light Gray: Available | Dark Gray: Unavailable</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={18} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click on an available table to select it for your reservation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={handleReservation}
            disabled={!selectedDate || !selectedTime || !selectedTable}
            className="px-8 py-3 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500"
          >
            Confirm Reservation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}