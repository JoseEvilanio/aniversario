
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Birthday, Notification, UserSettings } from '../types';
import { daysUntil } from '../utils';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface BirthdayContextType {
  birthdays: Birthday[];
  notifications: Notification[];
  settings: UserSettings;
  addBirthday: (b: Omit<Birthday, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  publicAddBirthday: (ownerId: string, b: Omit<Birthday, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateBirthday: (id: string, b: Partial<Birthday>) => Promise<void>;
  deleteBirthday: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateSettings: (s: UserSettings) => Promise<void>;
  unreadCount: number;
  permissionError: boolean;
  retryConnection: () => void;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

export const BirthdayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissionError, setPermissionError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [settings, setSettings] = useState<UserSettings>({
    notificationDays: 7,
    notificationsEnabled: true,
    notificationTime: '09:00'
  });

  const retryConnection = () => {
    setPermissionError(false);
    setRetryKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!user) {
      setBirthdays([]);
      setNotifications([]);
      setPermissionError(false);
      return;
    }

    // Subscribe to Birthdays
    const bdaysQuery = query(collection(db, 'users', user.uid, 'birthdays'));
    const unsubscribeBdays = onSnapshot(bdaysQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Birthday));
        setBirthdays(data);
        setPermissionError(false);
      },
      (error) => {
        if (error.code === 'permission-denied') {
          console.error("Erro de permissão no Firestore. Verifique as regras no Console.");
          setPermissionError(true);
        }
      }
    );

    // Subscribe to Notifications
    const notifsQuery = query(collection(db, 'users', user.uid, 'notifications'));
    const unsubscribeNotifs = onSnapshot(notifsQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setNotifications(data);
        setPermissionError(false);
      },
      (error) => {
        if (error.code === 'permission-denied') {
          setPermissionError(true);
        }
      }
    );

    // Load Settings
    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as UserSettings);
        } else {
          await setDoc(settingsRef, settings).catch(() => { });
        }
        setPermissionError(false);
      } catch (error: any) {
        if (error.code === 'permission-denied') {
          setPermissionError(true);
        }
      }
    };
    loadSettings();

    return () => {
      unsubscribeBdays();
      unsubscribeNotifs();
    };
  }, [user, retryKey]);

  const checkNotifications = useCallback(async () => {
    if (!user || !settings.notificationsEnabled || permissionError) return;

    try {
      for (const b of birthdays) {
        const d = daysUntil(b.birthDate);
        const year = new Date().getFullYear();
        const todayId = `today-${b.id}-${year}`;
        const upcomingId = `upcoming-${b.id}-${year}`;

        if ((d === 0 || d === 365 || d === 366) && !notifications.find(n => n.id === todayId)) {
          await setDoc(doc(db, 'users', user.uid, 'notifications', todayId), {
            birthdayId: b.id,
            title: `Aniversário de Hoje! 🎂`,
            message: `Hoje é o aniversário de ${b.fullName}!`,
            date: new Date().toISOString(),
            isRead: false,
            type: 'TODAY'
          });
        } else if (d > 0 && d <= settings.notificationDays && !notifications.find(n => n.id === upcomingId)) {
          await setDoc(doc(db, 'users', user.uid, 'notifications', upcomingId), {
            birthdayId: b.id,
            title: `Próximo Aniversário 🎈`,
            message: `O aniversário de ${b.fullName} é em ${d} dias.`,
            date: new Date().toISOString(),
            isRead: false,
            type: 'UPCOMING'
          });
        }
      }
    } catch (e) { }
  }, [birthdays, settings, notifications, user, permissionError]);

  useEffect(() => {
    if (birthdays.length > 0) {
      const timer = setTimeout(checkNotifications, 3000);
      return () => clearTimeout(timer);
    }
  }, [checkNotifications, birthdays.length]);

  const addBirthday = async (b: Omit<Birthday, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'birthdays'), {
      ...b,
      createdAt: new Date().toISOString(),
      userId: user.uid
    });
  };

  const publicAddBirthday = async (ownerId: string, b: Omit<Birthday, 'id' | 'createdAt' | 'userId'>) => {
    await addDoc(collection(db, 'users', ownerId, 'birthdays'), {
      ...b,
      createdAt: new Date().toISOString(),
      userId: ownerId
    });
  };

  const updateBirthday = async (id: string, b: Partial<Birthday>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'birthdays', id), b);
  };

  const deleteBirthday = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'birthdays', id));
  };

  const markNotificationRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { isRead: true });
  };

  const updateSettings = async (s: UserSettings) => {
    if (!user) return;
    setSettings(s);
    await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), s);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <BirthdayContext.Provider value={{
      birthdays,
      notifications,
      settings,
      addBirthday,
      publicAddBirthday,
      updateBirthday,
      deleteBirthday,
      markNotificationRead,
      updateSettings,
      unreadCount,
      permissionError,
      retryConnection
    }}>
      {children}
    </BirthdayContext.Provider>
  );
};

export const useBirthdays = () => {
  const context = useContext(BirthdayContext);
  if (!context) throw new Error('useBirthdays must be used within BirthdayProvider');
  return context;
};
