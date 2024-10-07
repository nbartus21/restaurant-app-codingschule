import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
const CTA = () => {
  return (
    <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Create your next culinary memory with us</h2>
          <Link to="/menu">
          <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
           View Our Menu
          </Button>
          </Link>
        </div>
      </section>
  )
}

export default CTA