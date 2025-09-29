import React from 'react';
import Hero from './components/Hero';
import Contact from './components/Contact';
import useWebsiteStore from './stores/websiteStore';

function App() {
  const { title } = useWebsiteStore();

  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">{{ title }}</h1>
          <div className="space-x-4">
            <a href="#hero" className="hover:text-blue-200">Home</a>
            <a href="#contact" className="hover:text-blue-200">Contact</a>
          </div>
        </nav>
      </header>
      
      <main>
        <section id="hero">
          <Hero />
        </section>
        
        <section id="contact" className="bg-gray-50">
          <Contact />
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white p-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 {{ title }}. All rights reserved.</p>
          <p className="mt-2 text-gray-400">
            [[ Proudly | Happily | Confidently ]] serving our customers since [[ 2020 | 2021 | 2019 ]].
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;