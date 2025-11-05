import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  clickable = false,
  onClick,
  ...props
}) => {
  const cardClasses = `
    card
    ${hover ? 'hover-lift hover-glow' : ''}
    ${clickable ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={cardClasses}
      onClick={handleClick}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Define subcomponents as proper React components
// Using React.forwardRef to ensure they're recognized as valid React components
const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`card-header ${className}`} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

const CardBody = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`card-body ${className}`} {...props}>
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`card-footer ${className}`} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

// Attach subcomponents to Card component
// Ensure they're properly attached BEFORE export
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
