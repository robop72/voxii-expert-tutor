import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface MfaFactor {
  id: string;
  friendly_name?: string;
  status: 'verified' | 'unverified';
}

export function useMfa(sessionReady: boolean) {
  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [aal, setAal] = useState<'aal1' | 'aal2' | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !sessionReady) return;
    const [{ data: factorData }, { data: aalData }] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    setFactors((factorData?.totp ?? []) as MfaFactor[]);
    setAal((aalData?.currentLevel as 'aal1' | 'aal2') ?? null);
  }, [sessionReady]);

  useEffect(() => { refresh(); }, [refresh]);

  const enroll = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'Voxii',
      friendlyName: 'Authenticator App',
    });
    if (error) throw error;
    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  }, []);

  const confirmEnrollment = useCallback(async (factorId: string, code: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: cData, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) throw cErr;
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: cData.id, code });
    if (vErr) throw vErr;
    await refresh();
  }, [refresh]);

  const verifyLogin = useCallback(async (factorId: string, code: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: cData, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) throw cErr;
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: cData.id, code });
    if (vErr) throw vErr;
    await refresh();
  }, [refresh]);

  const unenroll = useCallback(async (factorId: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    await refresh();
  }, [refresh]);

  const enrolledFactor = factors.find(f => f.status === 'verified') ?? null;
  const needsVerification = !!enrolledFactor && aal === 'aal1';

  return { factors, aal, enrolledFactor, needsVerification, enroll, confirmEnrollment, verifyLogin, unenroll, refresh };
}
