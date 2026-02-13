import { api } from './api';

export interface GlobalStats {
  totalOrganizations: number;
  totalNotifications: number;
  totalSms: number;
  totalEmail: number;
  totalWhatsapp: number;
  successRate: number;
  mrr: number;
  recentOrganizations: Array<{
    _id: string;
    name: string;
    plan: string;
    createdAt: string;
    status: string;
  }>;
  systemHealth: {
    apiGateway: { status: string; latency: number };
    messageQueue: { status: string; load: string };
    primaryDb: { status: string; uptime: number };
  };
}

export interface UsageStats {
  _id: string | null;
  smsCount: number;
  emailCount: number;
  whatsappCount: number;
}

export interface MessageLog {
  _id: string;
  organizationId: string;
  type: 'SMS' | 'EMAIL' | 'WHATSAPP';
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  plan: string;
  createdAt: string;
  status: string;
}

export const dashboardService = {
  /**
   * Fetch global dashboard stats
   */
  getGlobalStats: async (): Promise<GlobalStats> => {
    try {
      // Fetch organizations
      const organizations = await api.get<Organization[]>('/organizations');
      
      // Fetch usage stats (global)
      const usageStats = await api.get<UsageStats>('/usage/stats');
      
      // Fetch all transactions to calculate MRR
      const transactions = await api.get<any[]>('/transactions');
      
      // Fetch message logs to calculate success rate and volume
      const messageLogs = await api.get<MessageLog[]>('/message-logs/all');
      
      // Calculate derived metrics
      const totalNotifications = messageLogs.length;
      const successCount = messageLogs.filter(log => log.status === 'SENT' || log.status === 'DELIVERED').length;
      const successRate = totalNotifications > 0 ? (successCount / totalNotifications) * 100 : 0;
      
      // Calculate MRR from recent transactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTransactions = transactions.filter(t => new Date(t.createdAt) > thirtyDaysAgo);
      const mrr = recentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      // Get recent organizations (last 5)
      const recentOrgs = organizations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      return {
        totalOrganizations: organizations.length,
        totalNotifications,
        totalSms: usageStats.smsCount || 0,
        totalEmail: usageStats.emailCount || 0,
        totalWhatsapp: usageStats.whatsappCount || 0,
        successRate: parseFloat(successRate.toFixed(2)),
        mrr: parseFloat(mrr.toFixed(2)),
        recentOrganizations: recentOrgs,
        systemHealth: {
          apiGateway: { status: 'Healthy', latency: 24 },
          messageQueue: { status: 'Healthy', load: '12k/s' },
          primaryDb: { status: 'Healthy', uptime: 99.99 },
        },
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw error;
    }
  },

  /**
   * Fetch usage stats only
   */
  getUsageStats: async (): Promise<UsageStats> => {
    return api.get<UsageStats>('/usage/stats');
  },

  /**
   * Fetch message logs grouped by date and type for chart
   */
  getMessageLogsChartData: async () => {
    try {
      const messageLogs = await api.get<MessageLog[]>('/message-logs/all');
      
      // Group by date and type
      const groupedByDate: { [key: string]: { email: number; sms: number; push: number } } = {};
      
      messageLogs.forEach(log => {
        const date = new Date(log.createdAt);
        const key = `${date.getMonth() + 1}-${date.getDate()}`;
        
        if (!groupedByDate[key]) {
          groupedByDate[key] = { email: 0, sms: 0, push: 0 };
        }
        
        if (log.type === 'EMAIL') groupedByDate[key].email++;
        else if (log.type === 'SMS') groupedByDate[key].sms++;
        else if (log.type === 'WHATSAPP') groupedByDate[key].push++;
      });
      
      // Convert to array and sort by date
      const chartData = Object.entries(groupedByDate)
        .map(([date, counts]) => ({
          date: `Oct ${date.split('-')[1]}`,
          ...counts,
        }))
        .sort((a, b) => {
          const aDate = parseInt(a.date.split(' ')[1]);
          const bDate = parseInt(b.date.split(' ')[1]);
          return aDate - bDate;
        })
        .slice(-10); // Last 10 dates
      
      return chartData;
    } catch (error) {
      console.error('Error fetching message logs chart data:', error);
      return [];
    }
  },
};
