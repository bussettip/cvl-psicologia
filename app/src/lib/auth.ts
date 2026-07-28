export function getUsuario() {
  try {
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u);
  } catch {}
  try {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('crm_session='));
    if (cookie) {
      const value = cookie.split('=').slice(1).join('=');
      return JSON.parse(atob(value));
    }
  } catch {}
  return null;
}

export function setUsuario(user: any) {
  try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
}

export function clearUsuario() {
  try { localStorage.removeItem('user'); } catch {}
  document.cookie = 'crm_session=; path=/; max-age=0';
}

export function getPsicologa() {
  try {
    const s = localStorage.getItem('psicologa_user');
    if (s) return JSON.parse(s);
  } catch {}
  try {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('psicologa_user='));
    if (cookie) {
      const value = cookie.split('=').slice(1).join('=');
      return JSON.parse(atob(value));
    }
  } catch {}
  return null;
}

export function setPsicologa(user: any) {
  try { localStorage.setItem('psicologa_user', JSON.stringify(user)); } catch {}
}

export function clearPsicologa() {
  try { localStorage.removeItem('psicologa_user'); } catch {}
  document.cookie = 'psicologa_user=; path=/; max-age=0';
}
