import { Star } from "lucide-react";

const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Emily S.",
              rating: 5,
              text: "The flavors were exquisite! A truly memorable dining experience.",
            },
            {
              name: "Michael R.",
              rating: 5,
              text: "Impeccable service and a fantastic atmosphere. Will definitely return!",
            },
            {
              name: "Sarah L.",
              rating: 4,
              text: "The chef's tasting menu was a delightful journey through various cuisines.",
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-300 hover:scale-105"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="text-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-600 mb-4">{testimonial.text}</p>
              <p className="font-semibold">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
