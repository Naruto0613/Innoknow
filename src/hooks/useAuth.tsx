import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  displayName: string;
}

export function parseDate(val: any): Date {
  if (!val) return new Date();
  if (typeof val.toDate === 'function') {
    return val.toDate();
  }
  if (val.seconds) {
    return new Date(val.seconds * 1000);
  }
  return new Date(val);
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  level: string;
  school: string;
  plan: 'trial' | 'pro' | 'premium' | 'expired';
  planStartDate?: any;
  planExpiry?: any;
  accessExpiry?: any; // Compat
  trialStartDate?: any;
  trialExpiry?: any;
  trialEnd?: any; // Compat
  xp: number;
  streak: number;
  lastActiveDate: string;
  lessonsCompleted: number;
  certificatesEarned: string[];
  battleWins: number;
  battleLosses: number;
  paymentRef: string;
  paymentStatus: 'Paid' | 'Pending' | 'Free';
  createdAt: string;
  deviceId?: string;
  enrolledCourses?: string[];
  isPaid?: boolean;
  requestAccessStatus?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, level: string, school: string) => Promise<void>;
  logout: () => Promise<void>;
  getDeviceID: () => string;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true, 
  refreshProfile: async () => {},
  updateProfile: async () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  getDeviceID: () => ''
});

// Admin constants
export const ADMIN_UIDS = [
  'cNdJNgCoqHT5tlOpzKO9dWyQJXd2', // Admin 1
  'NIucl1MhGdRCmq412yzAKH4mmn23'  // Admin 2
];

export const ADMIN_EMAILS = [
  'naranbadrakh1013@gmail.com',
  'naranbadrakh@innoknow.mn',
  'admin1@innoknow.mn'
];

export function isUserAdmin(user: { uid: string; email?: string } | null | undefined): boolean {
  if (!user) return false;
  if (ADMIN_UIDS.includes(user.uid)) return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  return false;
}

function generatePaymentRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `user_${ref}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getDeviceID = () => getDeviceFingerprint();

  // Load user session
  useEffect(() => {
    const initSession = async () => {
      // Seed admins in mock database
      const allUsers = JSON.parse(localStorage.getItem('innoknow_registered_users') || '{}');
      const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');

      // Admin 1 Setup
      if (!allUsers['admin1@innoknow.mn']) {
        allUsers['admin1@innoknow.mn'] = {
          uid: 'cNdJNgCoqHT5tlOpzKO9dWyQJXd2',
          email: 'admin1@innoknow.mn',
          password: 'admin',
          displayName: 'Admin Setsen (One)'
        };
        allProfiles['admin1@innoknow.mn'] = {
          uid: 'cNdJNgCoqHT5tlOpzKO9dWyQJXd2',
          email: 'admin1@innoknow.mn',
          displayName: 'Admin Setsen (One)',
          level: 'C2',
          school: 'ШУТИС',
          plan: 'premium',
          planStartDate: new Date().toISOString(),
          planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          xp: 2500,
          streak: 100,
          lastActiveDate: new Date().toISOString(),
          lessonsCompleted: 45,
          certificatesEarned: ['beginner', 'intermediate', 'advanced', 'streak100'],
          battleWins: 24,
          battleLosses: 2,
          paymentRef: 'user_admin1',
          paymentStatus: 'Paid',
          createdAt: new Date().toISOString(),
          enrolledCourses: ['A1-Listening', 'B2-Grammar']
        };
      }

      // Admin 2 Setup
      if (!allUsers['naranbadrakh@innoknow.mn']) {
        allUsers['naranbadrakh@innoknow.mn'] = {
          uid: 'NIucl1MhGdRCmq412yzAKH4mmn23',
          email: 'naranbadrakh@innoknow.mn',
          password: 'admin',
          displayName: 'Naranbadrakh'
        };
        allProfiles['naranbadrakh@innoknow.mn'] = {
          uid: 'NIucl1MhGdRCmq412yzAKH4mmn23',
          email: 'naranbadrakh@innoknow.mn',
          displayName: 'Naranbadrakh',
          level: 'C2',
          school: 'МУИС',
          plan: 'premium',
          planStartDate: new Date().toISOString(),
          planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          xp: 2100,
          streak: 105,
          lastActiveDate: new Date().toISOString(),
          lessonsCompleted: 38,
          certificatesEarned: ['beginner', 'intermediate'],
          battleWins: 18,
          battleLosses: 5,
          paymentRef: 'user_admin2',
          paymentStatus: 'Paid',
          createdAt: new Date().toISOString(),
          enrolledCourses: ['B1-Vocabulary']
        };
      }

      localStorage.setItem('innoknow_registered_users', JSON.stringify(allUsers));
      localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));

      // Restore Session
      const storedUser = localStorage.getItem('innoknow_current_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // 1. Immediately resolve with local cached profile for instant 0ms startup
          let cachedProfile: UserProfile | null = allProfiles[parsedUser.email] || null;

          if (cachedProfile) {
            setProfile(cachedProfile);
          } else {
            // Setup a standard default local profile if not present locally
            const trialDuration = 72 * 60 * 60 * 1000; // 3 Days
            const trialStartDate = new Date().toISOString();
            const trialExpiryDate = new Date(Date.now() + trialDuration).toISOString();
            const newProfile: UserProfile = {
              uid: parsedUser.uid,
              email: parsedUser.email,
              displayName: parsedUser.displayName,
              level: 'A1',
              school: 'Ерөнхий Боловсролын Сургууль',
              plan: 'trial',
              trialStartDate: trialStartDate,
              trialExpiry: trialExpiryDate,
              trialEnd: trialExpiryDate, // compat
              planExpiry: trialExpiryDate, // for firestore rules compatibility during trial
              accessExpiry: trialExpiryDate, // compat
              xp: 100,
              streak: 0,
              lastActiveDate: new Date().toISOString(),
              lessonsCompleted: 0,
              certificatesEarned: [],
              battleWins: 0,
              battleLosses: 0,
              paymentRef: generatePaymentRef(),
              paymentStatus: 'Free',
              createdAt: new Date().toISOString(),
              deviceId: getDeviceID()
            };
            allProfiles[parsedUser.email] = newProfile;
            localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
            setProfile(newProfile);
            cachedProfile = newProfile;
          }

          // Stop loading spinner immediately so the courses and lessons are visible even if Firestore is slow/offline!
          setLoading(false);

          // 2. Perform background asynchronous remote Firestore synchronization
          Promise.resolve().then(async () => {
            try {
              const docRef = doc(db, 'users', parsedUser.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const fetchedProfile = docSnap.data() as UserProfile;
                setProfile(fetchedProfile);
                allProfiles[parsedUser.email] = fetchedProfile;
                localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
              } else {
                // Synchronize local fallback data to Firestore
                if (cachedProfile) {
                  await setDoc(docRef, cachedProfile, { merge: true });
                }
              }
            } catch (fsErr) {
              console.warn("Background firestore profiles state sync timed out/deferred (offline mode is active):", fsErr);
            }
          });

          return; // Skip blocking resolver
        } catch (err) {
          console.error('Error loading current user profile:', err);
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    const allUsers = JSON.parse(localStorage.getItem('innoknow_registered_users') || '{}');
    const registeredUser = allUsers[email.toLowerCase()];
    
    if (!registeredUser || registeredUser.password !== password) {
      throw new Error('Имэйл эсвэл нууц үг буруу байна.');
    }

    const curUser = {
      uid: registeredUser.uid,
      email: registeredUser.email,
      displayName: registeredUser.displayName
    };

    localStorage.setItem('innoknow_current_user', JSON.stringify(curUser));
    setUser(curUser);

    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    let userProfile = allProfiles[registeredUser.email];

    // Read from Firestore first
    try {
      const docRef = doc(db, 'users', registeredUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        userProfile = docSnap.data() as UserProfile;
      }
    } catch (e) {
      console.warn("Firestore fetch failed on login, fallback to local database.");
    }

    if (!userProfile) {
      const trialDuration = 72 * 60 * 60 * 1000; // 3 Days
      const trialStartDate = new Date().toISOString();
      const trialExpiryDate = new Date(Date.now() + trialDuration).toISOString();
      userProfile = {
        uid: registeredUser.uid,
        email: registeredUser.email,
        displayName: registeredUser.displayName,
        level: 'A1',
        school: 'МУИС',
        plan: 'trial',
        trialStartDate: trialStartDate,
        trialExpiry: trialExpiryDate,
        trialEnd: trialExpiryDate, // compat
        planExpiry: trialExpiryDate, // for firestore rules compatibility
        accessExpiry: trialExpiryDate, // compat
        xp: 100,
        streak: 0,
        lastActiveDate: new Date().toISOString(),
        lessonsCompleted: 0,
        certificatesEarned: [],
        battleWins: 0,
        battleLosses: 0,
        paymentRef: generatePaymentRef(),
        paymentStatus: 'Free',
        createdAt: new Date().toISOString(),
        deviceId: getDeviceID()
      };
    }

    allProfiles[registeredUser.email] = userProfile;
    localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
    setProfile(userProfile);

    try {
      await setDoc(doc(db, 'users', userProfile.uid), userProfile, { merge: true });
    } catch (e) {
      console.warn("Could not save to firestore:", e);
    }
  };

  const signup = async (email: string, password: string, name: string, level: string, school: string) => {
    const normalizedEmail = email.toLowerCase();
    const allUsers = JSON.parse(localStorage.getItem('innoknow_registered_users') || '{}');
    
    if (allUsers[normalizedEmail]) {
      throw new Error('Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна.');
    }

    const uid = 'US_' + Math.random().toString(36).substring(2, 11);
    
    // Check device footprint logic
    const currentDeviceID = getDeviceID();
    const usedTrials = JSON.parse(localStorage.getItem('innoknow_used_trials') || '{}');
    const usedTrialDevices = JSON.parse(localStorage.getItem('innoknow_used_trial_devices') || '{}');

    const emailAlreadyUsedTrial = !!usedTrials[normalizedEmail];
    const deviceAlreadyUsedTrial = !!usedTrialDevices[currentDeviceID];

    let hasEligibleTrial = true;
    if (emailAlreadyUsedTrial || deviceAlreadyUsedTrial) {
      hasEligibleTrial = false;
    }

    const now = new Date();
    const trialDuration = 72 * 60 * 60 * 1000; // 72 hours exactly
    const trialEnd = new Date(now.getTime() + trialDuration);

    // Save details
    allUsers[normalizedEmail] = {
      uid,
      email: normalizedEmail,
      password,
      displayName: name
    };
    localStorage.setItem('innoknow_registered_users', JSON.stringify(allUsers));

    const curUser = {
      uid,
      email: normalizedEmail,
      displayName: name
    };

    localStorage.setItem('innoknow_current_user', JSON.stringify(curUser));
    setUser(curUser);

    const userPlan = hasEligibleTrial ? 'trial' : 'expired';
    const trialExpiryVal = hasEligibleTrial ? trialEnd.toISOString() : now.toISOString();

    // Initial Profile with trial timestamps
    const newProfile: UserProfile = {
      uid,
      email: normalizedEmail,
      displayName: name,
      level: level,
      school: school || 'Ерөнхий Боловсролын Сургууль',
      plan: userPlan,
      trialStartDate: now.toISOString(),
      trialExpiry: trialExpiryVal,
      trialEnd: trialExpiryVal, // compat
      planExpiry: trialExpiryVal, // firebase rules
      accessExpiry: trialExpiryVal, // compat
      xp: 100, // starting gift XP
      streak: 0,
      lastActiveDate: now.toISOString(),
      lessonsCompleted: 0,
      certificatesEarned: [],
      battleWins: 0,
      battleLosses: 0,
      paymentRef: generatePaymentRef(),
      paymentStatus: 'Free',
      createdAt: now.toISOString(),
      deviceId: currentDeviceID
    };

    // If they got trial, register trial usages
    if (hasEligibleTrial) {
      usedTrials[normalizedEmail] = { email: normalizedEmail, dateUsed: now.toISOString() };
      usedTrialDevices[currentDeviceID] = { deviceId: currentDeviceID, email: normalizedEmail, dateUsed: now.toISOString() };
      localStorage.setItem('innoknow_used_trials', JSON.stringify(usedTrials));
      localStorage.setItem('innoknow_used_trial_devices', JSON.stringify(usedTrialDevices));
    }

    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    allProfiles[normalizedEmail] = newProfile;
    localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
    setProfile(newProfile);

    // Save to real Firestore!
    try {
      await setDoc(doc(db, 'users', uid), newProfile);
    } catch (e) {
      console.warn("Firestore sign up persistence offline backup used.", e);
    }
  };

  const logout = async () => {
    localStorage.removeItem('innoknow_current_user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    
    let matchedProfile = allProfiles[user.email];

    // Try Firestore
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        matchedProfile = docSnap.data() as UserProfile;
        // Keep LocalStorage updated
        allProfiles[user.email] = matchedProfile;
        localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
      }
    } catch (e) {
      console.warn("Could not fetch remote profile:", e);
    }

    if (matchedProfile) {
      setProfile(matchedProfile);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const allProfiles = JSON.parse(localStorage.getItem('innoknow_user_profiles') || '{}');
    
    const updatedProfile = {
      ...profile,
      ...data,
    };

    allProfiles[user.email] = updatedProfile;
    localStorage.setItem('innoknow_user_profiles', JSON.stringify(allProfiles));
    setProfile(updatedProfile);

    // Update Firestore
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, updatedProfile, { merge: true });
    } catch (e) {
      console.warn("Could not sync update to firestore:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, updateProfile, login, signup, logout, getDeviceID }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
