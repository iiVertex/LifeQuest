/**
 * Behavior Tracking Hook
 * Automatically tracks user sessions and behavior for adaptive learning
 */

import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';

let currentSessionId: string | null = null;

/**
 * Start a session for the user
 */
async function startSession(userId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/behavior/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.sessionId;
    }
  } catch (error) {
    console.error('Failed to start session:', error);
  }
  return null;
}

/**
 * End the current session
 */
async function endSession(sessionId: string): Promise<void> {
  try {
    await fetch('/api/behavior/session/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to end session:', error);
  }
}

/**
 * Track an action in the current session
 */
export async function trackAction(): Promise<void> {
  if (!currentSessionId) return;

  try {
    await fetch('/api/behavior/session/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId }),
      credentials: 'include',
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
  }
}

/**
 * Hook to track user session automatically
 * Call this in your main App component
 */
export function useSessionTracking() {
  const { user } = useAuth();
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (!user || sessionStartedRef.current) return;

    // Start session when user logs in
    const initSession = async () => {
      const sessionId = await startSession(user.id);
      if (sessionId) {
        currentSessionId = sessionId;
        sessionStartedRef.current = true;
        console.log('[Behavior Tracking] Session started:', sessionId);
      }
    };

    initSession();

    // End session when user leaves or closes tab
    const handleBeforeUnload = () => {
      if (currentSessionId) {
        // Use sendBeacon for reliable tracking on page unload
        const blob = new Blob(
          [JSON.stringify({ sessionId: currentSessionId })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/behavior/session/end', blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (currentSessionId) {
        endSession(currentSessionId);
        currentSessionId = null;
        sessionStartedRef.current = false;
      }
    };
  }, [user]);
}

/**
 * Hook to track page actions
 * Automatically tracks when specific actions occur
 */
export function useActionTracking() {
  return {
    trackAction,
  };
}
