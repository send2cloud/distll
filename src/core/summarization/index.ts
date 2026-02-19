import { SummarizationService } from './types';
import { CloudflareSummarizationAdapter } from '@/adapters/cloudflare/SummarizationAdapter';

// We switched to Cloudflare! The UI logic doesn't need to change at all.
export const summarizationService: SummarizationService = new CloudflareSummarizationAdapter();

export * from './types';
