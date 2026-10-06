export interface StreamDto {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  format: string;
  category?: string;
  live?: boolean;
  featured?: boolean;
  tags?: string[];
  artwork?: {
    poster?: string;
    backdrop?: string;
    colors?: string[];
  };
  platforms?: string[];
}
