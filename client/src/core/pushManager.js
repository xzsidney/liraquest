/**
 * LiraQuest - Gerenciador Client-side de Web Push Notifications (PWA)
 * Registra Service Worker, converte chaves VAPID e gerencia inscrições com o backend.
 */

import { api } from './api.js';

// Converte string base64 de chave VAPID para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica se o navegador atual suporta Service Worker e Web Push
 */
export function isPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Retorna o status de permissão do navegador: 'granted', 'denied' ou 'default'
 */
export function getPermissionState() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Registra o Service Worker na inicialização da aplicação
 */
export async function registerServiceWorker() {
  if (!isPushSupported()) {
    console.log('ℹ️ [Push] Este navegador ou dispositivo não possui suporte a Web Push.');
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ [ServiceWorker] Registrado com sucesso:', reg.scope);
    return reg;
  } catch (err) {
    console.error('❌ [ServiceWorker] Falha ao registrar sw.js:', err);
    return null;
  }
}

/**
 * Obtém a inscrição ativa atual deste aparelho (se houver)
 */
export async function getActiveSubscription() {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.error('Erro ao buscar inscrição ativa:', err);
    return null;
  }
}

/**
 * Solicita permissão e cadastra o aparelho para receber notificações
 */
export async function subscribeDeviceToPush() {
  if (!isPushSupported()) {
    throw new Error('Seu navegador não suporta notificações em segundo plano.');
  }

  // 1. Solicita permissão nativa
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Permissão de notificações foi bloqueada no seu navegador. Ative nas configurações do site.'
        : 'Permissão não concedida.'
    );
  }

  // 2. Busca chave pública VAPID no backend
  const keyRes = await api.get('/api/push/public-key');
  if (!keyRes || !keyRes.publicKey) {
    throw new Error('Chave de segurança VAPID não retornada pelo servidor.');
  }

  // 3. Obtém ou cria a subscrição no PushManager do navegador
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    const appServerKey = urlBase64ToUint8Array(keyRes.publicKey);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
    });
  }

  // 4. Salva a inscrição no backend
  const subJson = sub.toJSON();
  const res = await api.post('/api/push/subscribe', {
    subscription: subJson,
    userAgent: navigator.userAgent,
  });

  return res;
}

/**
 * Cancela a inscrição de notificações deste aparelho
 */
export async function unsubscribeDeviceFromPush() {
  if (!isPushSupported()) return false;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();

  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    try {
      await api.post('/api/push/unsubscribe', { endpoint });
    } catch (e) {
      console.warn('Erro ao avisar backend sobre desinscrição:', e);
    }
    return true;
  }
  return false;
}
