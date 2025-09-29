import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            [[ Quick | Fast | Speedy ]] [[ delivery | service | solutions ]] in [[ Dhaka | Bangladesh | your area ]].
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{{ description }}</p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
              [[ Get Started | Order Now | Learn More ]]
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300">
              [[ Contact Us | Call Now | Get Quote ]]
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;