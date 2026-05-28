import React from 'react';
import { motion } from 'motion/react';
import { Play, Clock, BarChart } from 'lucide-react';

interface CourseCardProps {
  title: string;
  level: string;
  duration: string;
  image: string;
  lessons: number;
}

export default function CourseCard({ title, level, duration, image, lessons }: CourseCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#58007E]">
          {level}
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-4 line-clamp-1 italic font-serif tracking-tight">{title}</h3>
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{duration}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <BarChart size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{lessons} Lessons</span>
          </div>
        </div>
        <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-[#58007E] transition-colors">
          <Play size={14} fill="currentColor" /> Resume Course
        </button>
      </div>
    </motion.div>
  );
}
