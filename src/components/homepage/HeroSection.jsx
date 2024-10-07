import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 text-center bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="flex justify-center mb-6 space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />
        ))}
      </div>
      <h1 className="text-5xl font-bold mb-6">Indulge in the Finest Dining Experience</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Savor exquisite flavors in an ambiance of elegance and warmth at Gourmet Haven.
      </p>
      <div className="flex justify-center space-x-4">

       <Link to="/reservation">
       <Button className="bg-blue-600 text-white hover:bg-blue-700">Reserve a Table</Button>
       </Link>
        <Link to="/menu">
        <Button variant="outline">View Menu</Button>
        </Link>
      </div>
    </div>
  </section>
  )
}

export default HeroSection