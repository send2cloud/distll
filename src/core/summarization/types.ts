import { ErrorCodeType } from '../errors';

export interface SummarizationRequest {
    url?: string;
    content?: string;
    style: string;
    bulletCount?: number;
    model: string;
}

export interface SummarizationResponse {
    summary: string;
    originalContent: string;
}

export interface SummarizationService {
    process(request: SummarizationRequest): Promise<SummarizationResponse>;
}
