import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatMessage } from '@/types';

// Types
export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface Conversation {
  id: string;
  lead_id: string;
  session_id: string;
  title?: string;
  status: 'active' | 'completed' | 'archived';
  stage: 'initial' | 'discovery' | 'analysis' | 'proposal' | 'follow_up' | 'completed';
  total_messages: number;
  ai_cost: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface Transcript {
  id: string;
  conversation_id: string;
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'file' | 'system';
  token_count: number;
  cost: number;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ConversationSummary {
  id: string;
  conversation_id: string;
  summary_type: 'periodic' | 'final' | 'milestone';
  summary: string;
  key_points: string[];
  action_items: string[];
  message_range_start?: number;
  message_range_end?: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface EmailLog {
  id: string;
  lead_id: string;
  conversation_id?: string;
  email_type: 'welcome' | 'follow_up' | 'report' | 'summary' | 'marketing';
  recipient_email: string;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  external_id?: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  metadata: Record<string, any>;
}

export class LeadManager {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Lead Management
  async createLead(leadData: {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    source?: string;
    metadata?: Record<string, any>;
  }): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert([{
        email: leadData.email,
        name: leadData.name,
        company: leadData.company,
        phone: leadData.phone,
        source: leadData.source || 'website',
        metadata: leadData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        // Lead already exists, return existing lead
        return this.getLeadByEmail(leadData.email);
      }
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    return data;
  }

  async getLeadByEmail(email: string): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new Error(`Failed to get lead: ${error.message}`);
    }

    return data;
  }

  async updateLeadStatus(leadId: string, status: Lead['status']): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead status: ${error.message}`);
    }

    return data;
  }

  async getLeadWithConversations(leadId: string): Promise<Lead & { conversations: Conversation[] }> {
    const { data, error } = await this.supabase
      .from('leads')
      .select(`
        *,
        conversations (*)
      `)
      .eq('id', leadId)
      .single();

    if (error) {
      throw new Error(`Failed to get lead with conversations: ${error.message}`);
    }

    return data;
  }

  // Conversation Management
  async createConversation(conversationData: {
    lead_id: string;
    session_id: string;
    title?: string;
    metadata?: Record<string, any>;
  }): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert([{
        lead_id: conversationData.lead_id,
        session_id: conversationData.session_id,
        title: conversationData.title,
        metadata: conversationData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data;
  }

  async getConversationBySessionId(sessionId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return data;
  }

  async updateConversationStage(conversationId: string, stage: Conversation['stage']): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({ stage })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation stage: ${error.message}`);
    }

    return data;
  }

  async endConversation(conversationId: string): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .update({ 
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to end conversation: ${error.message}`);
    }

    return data;
  }

  // Transcript Management
  async addMessage(messageData: {
    conversation_id: string;
    message_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    message_type?: 'text' | 'image' | 'audio' | 'file' | 'system';
    token_count?: number;
    cost?: number;
    metadata?: Record<string, any>;
  }): Promise<Transcript> {
    const { data, error } = await this.supabase
      .from('transcripts')
      .insert([{
        conversation_id: messageData.conversation_id,
        message_id: messageData.message_id,
        role: messageData.role,
        content: messageData.content,
        message_type: messageData.message_type || 'text',
        token_count: messageData.token_count || 0,
        cost: messageData.cost || 0,
        metadata: messageData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }

    // Update conversation message count and cost
    await this.updateConversationStats(messageData.conversation_id, messageData.cost || 0);

    return data;
  }

  async getConversationTranscript(conversationId: string): Promise<Transcript[]> {
    const { data, error } = await this.supabase
      .from('transcripts')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to get conversation transcript: ${error.message}`);
    }

    return data;
  }

  private async updateConversationStats(conversationId: string, additionalCost: number): Promise<void> {
    const { error } = await this.supabase.rpc('update_conversation_stats', {
      p_conversation_id: conversationId,
      p_additional_cost: additionalCost
    });

    if (error) {
      console.error('Failed to update conversation stats:', error);
      // Don't throw error as this is not critical
    }
  }

  // Summary Management
  async createConversationSummary(summaryData: {
    conversation_id: string;
    summary_type: 'periodic' | 'final' | 'milestone';
    summary: string;
    key_points?: string[];
    action_items?: string[];
    message_range_start?: number;
    message_range_end?: number;
    metadata?: Record<string, any>;
  }): Promise<ConversationSummary> {
    const { data, error } = await this.supabase
      .from('conversation_summaries')
      .insert([{
        conversation_id: summaryData.conversation_id,
        summary_type: summaryData.summary_type,
        summary: summaryData.summary,
        key_points: summaryData.key_points || [],
        action_items: summaryData.action_items || [],
        message_range_start: summaryData.message_range_start,
        message_range_end: summaryData.message_range_end,
        metadata: summaryData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation summary: ${error.message}`);
    }

    return data;
  }

  // Email Logging
  async logEmailSent(emailData: {
    lead_id: string;
    conversation_id?: string;
    email_type: EmailLog['email_type'];
    recipient_email: string;
    subject: string;
    external_id?: string;
    metadata?: Record<string, any>;
  }): Promise<EmailLog> {
    const { data, error } = await this.supabase
      .from('email_logs')
      .insert([{
        lead_id: emailData.lead_id,
        conversation_id: emailData.conversation_id,
        email_type: emailData.email_type,
        recipient_email: emailData.recipient_email,
        subject: emailData.subject,
        external_id: emailData.external_id,
        metadata: emailData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log email: ${error.message}`);
    }

    return data;
  }

  async updateEmailStatus(emailId: string, status: EmailLog['status'], eventData?: {
    opened_at?: string;
    clicked_at?: string;
  }): Promise<EmailLog> {
    const updateData: any = { status };
    
    if (eventData?.opened_at) {
      updateData.opened_at = eventData.opened_at;
    }
    
    if (eventData?.clicked_at) {
      updateData.clicked_at = eventData.clicked_at;
    }

    const { data, error } = await this.supabase
      .from('email_logs')
      .update(updateData)
      .eq('id', emailId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update email status: ${error.message}`);
    }

    return data;
  }

  // Analytics and Reporting
  async getLeadAnalytics(timeRange: { start: string; end: string }) {
    const { data, error } = await this.supabase
      .from('lead_conversation_summary')
      .select('*')
      .gte('lead_created_at', timeRange.start)
      .lte('lead_created_at', timeRange.end);

    if (error) {
      throw new Error(`Failed to get lead analytics: ${error.message}`);
    }

    return {
      leads: data,
      totalLeads: data.length,
      totalConversations: data.reduce((sum, lead) => sum + (lead.total_conversations || 0), 0),
      totalMessages: data.reduce((sum, lead) => sum + (lead.total_messages || 0), 0),
      totalAiCost: data.reduce((sum, lead) => sum + (lead.total_ai_cost || 0), 0),
      statusBreakdown: this.groupBy(data, 'lead_status')
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  // Session Management Helper
  async getOrCreateSession(sessionId: string, leadEmail?: string): Promise<{
    lead: Lead;
    conversation: Conversation;
  }> {
    // First try to get existing conversation
    let conversation = await this.getConversationBySessionId(sessionId);
    
    if (conversation) {
      // Get the associated lead
      const lead = await this.getLeadByEmail(
        await this.getLeadEmailByConversationId(conversation.id)
      );
      return { lead, conversation };
    }

    // If no conversation exists and we have an email, create new session
    if (leadEmail) {
      const lead = await this.createLead({ email: leadEmail });
      conversation = await this.createConversation({
        lead_id: lead.id,
        session_id: sessionId,
        title: `Conversation ${new Date().toLocaleDateString()}`
      });
      return { lead, conversation };
    }

    throw new Error('No existing session found and no email provided to create new session');
  }

  private async getLeadEmailByConversationId(conversationId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('leads(email)')
      .eq('id', conversationId)
      .single();

    if (error) {
      throw new Error(`Failed to get lead email: ${error.message}`);
    }

    return (data as any).leads.email;
  }
}

// Singleton instance
let leadManagerInstance: LeadManager | null = null;

export const getLeadManager = (): LeadManager => {
  if (!leadManagerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration not found');
    }
    
    leadManagerInstance = new LeadManager(supabaseUrl, supabaseKey);
  }
  
  return leadManagerInstance;
};

export default LeadManager;