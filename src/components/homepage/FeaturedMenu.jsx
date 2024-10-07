

const FeaturedMenu = () => {
    return (
      <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Specials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Truffle Risotto", image: "https://placehold.co/600x400", description: "Creamy Arborio rice with black truffle", price: "$24" },
            { name: "Seared Scallops", image: "https://placehold.co/600x400", description: "Pan-seared scallops with citrus glaze", price: "$28" },
            { name: "Wagyu Steak", image: "https://placehold.co/600x400", description: "Premium Wagyu beef with roasted vegetables", price: "$45" }
          ].map((dish, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              <img src={dish.image} alt={dish.name} width={400} height={300} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                <p className="text-gray-600 mb-4">{dish.description}</p>
                <p className="text-lg font-bold">{dish.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    )
  }
  
  export default FeaturedMenu