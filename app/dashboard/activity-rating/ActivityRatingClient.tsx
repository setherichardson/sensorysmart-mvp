"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/supabase/client';

interface RatingOption {
  value: 'regulated' | 'calmer' | 'neutral' | 'distracted' | 'dysregulated';
  emoji: string;
  label: string;
}

const ratingOptions: RatingOption[] = [
  { value: 'regulated', emoji: '😌', label: 'Regulated' },
  { value: 'calmer', emoji: '😊', label: 'Calmer' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'distracted', emoji: '😵‍💫', label: 'Distracted' },
  { value: 'dysregulated', emoji: '😖', label: 'Dysregulated' },
];

export default function ActivityRatingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activityData, setActivityData] = useState<{
    id: string;
    activity_name: string;
    activity_type: string;
    duration_minutes?: number;
  } | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError || !profileData) {
          router.push('/onboarding');
          return;
        }
        const activityId = searchParams.get('activityId');
        const activityName = searchParams.get('activityName');
        const activityType = searchParams.get('activityType');
        const durationMinutes = searchParams.get('durationMinutes');
        if (!activityId || !activityName || !activityType) {
          router.push('/dashboard/today');
          return;
        }
        setActivityData({
          id: activityId,
          activity_name: activityName,
          activity_type: activityType,
          duration_minutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        });
        setUser(user);
        setProfile(profileData);
      } catch (err) {
        console.error('Error loading user data:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [router, searchParams]);

  const handleRatingSelect = async (rating: string) => {
    if (!activityData) return;
    setSubmitting(true);
    try {
      if (activityData.id.startsWith('temp-')) {
        router.push('/dashboard/journal');
        return;
      }
      const { error } = await supabase
        .from('activity_completions')
        .update({ rating: rating as any })
        .eq('id', activityData.id);
      if (error) {
        alert('Failed to save rating. Please try again.');
        return;
      }
      router.push('/dashboard/journal');
    } catch (error) {
      alert('Failed to save rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="loading-text">Loading rating page...</p>
        </div>
      </div>
    );
  }
  if (!user || !profile || !activityData) {
    return null;
  }
  return (
    <div className="rating-container">
      <div className="rating-wrapper">
        <div className="rating-question">
          <h2 className="question-text">
            How did {profile.child_name} do with "{activityData.activity_name}"?
          </h2>
        </div>
        <div className="rating-options">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRatingSelect(option.value)}
              disabled={submitting}
              className="rating-option-button"
            >
              <div className="rating-option-content">
                <div className="rating-emoji">{option.emoji}</div>
                <div className="rating-label">{option.label}</div>
              </div>
            </button>
          ))}
        </div>
        {submitting && (
          <div className="submitting-overlay">
            <div className="submitting-content">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              <p className="submitting-text">Saving rating...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 