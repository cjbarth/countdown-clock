export as namespace FFmpeg;

export interface ffmpeg {
  load(): Promise<void>;
  run(...args: string[]): Promise<void>;
  FS(method: "writeFile", fileName: string, fileBytes: Uint8Array): void;
  FS(method: "readFile", fileName: string): Uint8Array;
  FS(method: "unlink", fileName: string): void;
  setLogging(enabled: boolean): void;
  setLogger(logger: LoggerCallback): void;
  setProgress(progress: ProgressCallback): void;
}

export type LoggerCallback = (data: LoggerData) => void;
export type ProgressCallback = (data: string) => void;

export interface LoggerData {
  type: string;
  message: string;
}

export interface CreateFFmpegOptions {
  corePath?: string;
  log?: boolean;
  logger?: LoggerCallback;
  progress?: ProgressCallback;
}

export type MediaType = string | File | Blob | Buffer;

export function createFFmpeg(options: CreateFFmpegOptions): ffmpeg;
export function fetchFile(media: MediaType): Uint8Array;
