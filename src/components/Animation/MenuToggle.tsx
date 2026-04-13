/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion';

const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="4"
    stroke="hsl(0, 0%, 100%)"
    strokeLinecap="round"
    vectorEffect="non-scaling-stroke"
    {...props}
  />
);

const VB_WIDTH = 36;
const RIGHT = VB_WIDTH - 2;

export const MenuToggle = ({ isOpen = false }) => (
  <motion.div initial={false} animate={isOpen ? 'open' : 'closed'} style={{ display: 'flex' }}>
    <motion.svg width="36" height="36" viewBox="0 0 36 36" preserveAspectRatio="none">
      <Path
        variants={{
          closed: { d: `M 2 8 L ${RIGHT} 8` },
          open: { d: `M 4 6 L ${RIGHT - 2} 30` }
        }}
      />
      <Path
        d={`M 2 18 L ${RIGHT} 18`}
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 }
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: `M 2 28 L ${RIGHT} 28` },
          open: { d: `M 4 30 L ${RIGHT - 2} 6` }
        }}
      />
    </motion.svg>
  </motion.div>
);
