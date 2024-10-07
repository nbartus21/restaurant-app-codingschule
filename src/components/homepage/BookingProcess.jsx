import { Fragment, useState } from "react";
import {
  UserPlus,
  CalendarDays,
  CreditCard,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BookingProcess = () => {
  const [hoveredStep, setHoveredStep] = useState(null);
  const steps = [
    { icon: UserPlus, text: "Sign Up" },
    { icon: CalendarDays, text: "Reserve Table" },
    { icon: Clock, text: "Choose A Time Slot" },
    { icon: CreditCard, text: "Payment" },
    { icon: CheckCircle, text: "Confirmation" },
  ];
  return (
    <section className="py-20 bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12">Our Booking Process</h2>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
          </div>
          <div className="relative z-10 flex justify-between items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <Fragment key={index}>
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  onHoverStart={() => setHoveredStep(index)}
                  onHoverEnd={() => setHoveredStep(null)}
                >
                  <motion.div
                    className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                      perspective: "1000px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <step.icon size={32} className="text-blue-600" />
                  </motion.div>
                  <p className="text-sm font-medium">{step.text}</p>
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    className="h-1 bg-blue-400 flex-grow mx-4"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX:
                          hoveredStep !== null && hoveredStep > index ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
        <Link to="/reservation" className="z-10 relative">
        <Button
          size="lg"
          className="bg-blue-600 cursor-pointer text-white hover:bg-blue-700 mt-9"
          >
          Reserve Now
        </Button>
          </Link>
      </div>
    </section>
  );
};

export default BookingProcess;
