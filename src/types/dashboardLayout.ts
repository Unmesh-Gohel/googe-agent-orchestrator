import { AgentId } from './orchestrator';

export type DashboardCardType = 'agent' | 'workspace_summary';

export type SummaryWidgetType =
  | 'tasks'
  | 'calendar'
  | 'gmail'
  | 'sheets'
  | 'forms'
  | 'drive'
  | 'youtube'
  | 'ads';

export interface DashboardCardConfig {
  id: string;
  type: DashboardCardType;
  agentId?: AgentId;
  summaryType?: SummaryWidgetType;
  title: string;
  colSpan: 1 | 2 | 3; // 1, 2, or 3 columns in the responsive 3-column grid
  isExpandedHeight: boolean; // Compact vs Expanded height
  isVisible: boolean;
  order: number;
}
