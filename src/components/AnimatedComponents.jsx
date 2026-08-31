import { motion } from 'framer-motion';

export const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

export const SlideIn = ({ children, direction = "left", delay = 0, className = "" }) => {
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? -50 : direction === "right" ? 50 : 0,
            y: direction === "up" ? 50 : direction === "down" ? -50 : 0
        },
        visible: { opacity: 1, x: 0, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.5, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const PulseCard = ({ children, className = "", onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        className={className}
        onClick={onClick}
    >
        {children}
    </motion.div>
);

export const StaggerContainer = ({ children, className = "", delayChildren = 0.1, staggerChildren = 0.1 }) => (
    <motion.div
        initial="hidden"
        animate="show"
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    delayChildren,
                    staggerChildren
                }
            }
        }}
        className={className}
    >
        {children}
    </motion.div>
);
