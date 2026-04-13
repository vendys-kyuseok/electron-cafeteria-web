import { motion } from 'framer-motion';
import { Box } from '@mui/material';

type SpinLoaderProps = {
  className?: string;
  style?: React.CSSProperties;
};

type LoadingOverlayProps = {
  open: boolean;
  message?: React.ReactNode;
};

const DOTS: Array<{ x: number; y: number; opacity: number }> = [
  { x: 1.5, y: 0, opacity: 0.75 },
  { x: 1.1, y: 1.1, opacity: 0.75 },
  { x: 0, y: 1.5, opacity: 0.75 },
  { x: -1.1, y: 1.1, opacity: 0.75 },
  { x: -1.5, y: 0, opacity: 0.75 },
  { x: -1.1, y: -1.1, opacity: 0.75 },
  { x: 0, y: -1.5, opacity: 0.75 },
  { x: 1.1, y: -1.1, opacity: 0.75 }
];

export function SpinLoader({ className, style }: SpinLoaderProps) {
  return (
    <Box
      role="status"
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        width: '5em',
        height: '5em',
        ...style
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
        style={{ position: 'relative', width: '1em', height: '1em' }}
      >
        {DOTS.map((dot, idx) => (
          <span
            key={idx}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '1em',
              height: '1em',
              borderRadius: '0.5em',
              backgroundColor: `rgba(220, 220, 220, ${dot.opacity})`,
              transform: `translate(-50%, -50%) translate(${dot.x}em, ${dot.y}em)`
            }}
          />
        ))}
      </motion.div>
    </Box>
  );
}

export function LoadingOverlay({ open, message }: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <Box
      sx={{
        zIndex: 10,
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0px 8px 4px',
        borderRadius: '10px',
        background: '#00000052',
        color: '#ffffff'
      }}
    >
      <SpinLoader />
      <Box sx={{ mt: 1, fontSize: '24px', fontWeight: 700 }}>{message}</Box>
    </Box>
  );
}
