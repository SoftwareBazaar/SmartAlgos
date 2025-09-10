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

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
