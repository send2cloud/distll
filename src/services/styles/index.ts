
export * from './types';
export * from './styleNormalizer';
export * from './pathParser';
export * from './StyleService';
export * from './StyleFacade';

// Export the facade instance for direct use
import { styleFacade } from './StyleFacade';
export { styleFacade };
