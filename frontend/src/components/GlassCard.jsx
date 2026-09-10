import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, glow = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`
        glass-card rounded-2xl p-6
        ${hover ? 'hover-glow' : ''}
        ${glow ? 'gradient-glow' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
