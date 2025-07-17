// Analytics utility for tracking user interactions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Custom event tracking functions
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Predefined tracking events for common user actions
export const analytics = {
  // User journey tracking
  signup: (method: string = 'email') => {
    trackEvent('sign_up', 'engagement', method);
  },
  
  profileCreated: (childAge: string) => {
    trackEvent('profile_created', 'engagement', childAge);
  },
  
  assessmentStarted: () => {
    trackEvent('assessment_started', 'engagement');
  },
  
  assessmentCompleted: (profile: string) => {
    trackEvent('assessment_completed', 'engagement', profile);
  },
  
  trialStarted: (plan: string) => {
    trackEvent('trial_started', 'conversion', plan);
  },
  
  subscriptionStarted: (plan: string) => {
    trackEvent('subscription_started', 'conversion', plan);
  },
  
  // Feature usage tracking
  activityStarted: (activityType: string) => {
    trackEvent('activity_started', 'feature_usage', activityType);
  },
  
  activityCompleted: (activityType: string, rating: string) => {
    trackEvent('activity_completed', 'feature_usage', `${activityType}_${rating}`);
  },
  
  coachChatStarted: () => {
    trackEvent('coach_chat_started', 'feature_usage');
  },
  
  coachMessageSent: () => {
    trackEvent('coach_message_sent', 'feature_usage');
  },
  
  journalEntryCreated: () => {
    trackEvent('journal_entry_created', 'feature_usage');
  },
  
  // Navigation tracking
  pageView: (page: string) => {
    trackEvent('page_view', 'navigation', page);
  },
  
  // Error tracking
  error: (errorType: string, errorMessage: string) => {
    trackEvent('error', 'system', `${errorType}: ${errorMessage}`);
  },
  
  // Payment tracking
  paymentFailed: (reason: string) => {
    trackEvent('payment_failed', 'conversion', reason);
  },
  
  paymentSucceeded: (plan: string) => {
    trackEvent('payment_succeeded', 'conversion', plan);
  },
  
  // Trial tracking
  trialEnded: (converted: boolean) => {
    trackEvent('trial_ended', 'conversion', converted ? 'converted' : 'not_converted');
  },
  
  trialCancelled: () => {
    trackEvent('trial_cancelled', 'conversion');
  },
};

// Enhanced page view tracking with custom dimensions
export const trackPageView = (page: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-F1R40ZZC8P', {
      page_title: title || page,
      page_location: window.location.href,
      custom_map: {
        'custom_dimension1': 'user_type',
        'custom_dimension2': 'subscription_status',
      },
    });
    
    // Also track as custom event for better filtering
    analytics.pageView(page);
  }
}; 