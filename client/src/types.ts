export interface GraphResult {
  success: boolean;
  session_id: string;
  image: string;
  chart_type: string;
  summary: {
    data_shape: string;
    chart_type: string;
    columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    query_processed: string;
    key_insights?: string;
  };
  message: string;
  error?: string;
  data_warnings?: {
    message: string;
    suggestions: string[];
    issues: string[];
  };
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled: boolean;
}

export interface ChatbotResponse {
  message: string;
  suggestions: string[];
  data_info?: {
    columns: string[];
    numeric_columns: string[];
    categorical_columns: string[];
    data_shape: string;
  };
}

export interface QueryInputProps {
  onQuerySubmit: (query: string) => void;
  onGraphGenerated: (result: GraphResult) => void;
  onLoadingChange: (loading: boolean) => void;
  onChatbotResponse?: (response: ChatbotResponse) => void;
  selectedFile: File | null;
  query: string;
  disabled: boolean;
}

export interface GraphDisplayProps {
  graphResult: GraphResult | null;
  isLoading: boolean;
  onReset: () => void;
}
