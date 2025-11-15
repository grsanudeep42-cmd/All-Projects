import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type NotificationCounts = { newApplicants: number, newResponses: number };
const NotificationContext = createContext<NotificationCounts>({ newApplicants: 0, newResponses: 0 });

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token, userId, role } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({ newApplicants: 0, newResponses: 0 });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const appsRes = await fetch('http://127.0.0.1:8000/notifications/count/applications', { headers: { Authorization: `Bearer ${token}` } });
        const respRes = await fetch('http://127.0.0.1:8000/notifications/count/responses', { headers: { Authorization: `Bearer ${token}` } });
        const appsJson = await appsRes.json(), respJson = await respRes.json();
        setCounts({ newApplicants: appsJson.count, newResponses: respJson.count });
      } catch { setCounts({ newApplicants: 0, newResponses: 0 }); }
    })();
  }, [token, userId, role]);
  return <NotificationContext.Provider value={counts}>{children}</NotificationContext.Provider>;
}
export const useNotificationCounts = () => useContext(NotificationContext);
