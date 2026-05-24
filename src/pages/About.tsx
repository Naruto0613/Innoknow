import React from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Zap, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
      <div className="text-center mb-20">
        <h1 className="text-6xl font-bold italic font-serif mb-6 tracking-tight">Our Mission</h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed font-medium">
          We believe that language is a bridge, not a barrier. Our goal is to make English acquisition as natural, fun, and accessible as possible through the power of AI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
        >
          <img src="https://picsum.photos/seed/team/800/600" alt="Team" className="rounded-[40px] shadow-2xl shadow-indigo-100" referrerPolicy="no-referrer" />
        </motion.div>
        <div className="space-y-8">
          {[
            { icon: Heart, title: 'Student-First', desc: 'Every feature we build is designed with the student experience in mind.' },
            { icon: Shield, title: 'Research-Backed', desc: 'Our methodology is based on the latest linguistic and cognitive science.' },
            { icon: Zap, title: 'Innovation', desc: 'We leverage cutting-edge AI to provide a truly personalized learning journey.' }
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-12 h-12 bg-[#58007E10] text-[#58007E] rounded-2xl flex items-center justify-center shrink-0">
                {/* Fallback for components that might not be capitalised correctly in object */}
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
