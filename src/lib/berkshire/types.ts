export interface ShareholderLetterFile {
  fileName: string;
  filePath: string;
  year: string;
}

export interface IngestedLetterSummary {
  fileName: string;
  year: string;
  chunkCount: number;
}

export interface IngestionSummary {
  processedFiles: IngestedLetterSummary[];
  totalDocuments: number;
  totalChunks: number;
}
