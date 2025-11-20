import crypto from 'crypto';
import admin from 'firebase-admin';

export const runtime = 'nodejs'; 


// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Gestion des sauts de ligne
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    ...firebaseConfig
  });
}
const db = admin.firestore();

export async function POST(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // fetch raw body
    const rawBody = await request.text();
    console.log('Raw body:', rawBody);

    let payload;
    try {
      payload = JSON.parse(rawBody);
      console.log('Événement reçu:', payload);
    } catch (e) {
      payload = {};
    }

    // Fetch Twitch headers
    const messageId = request.headers.get('twitch-eventsub-message-id');
    const messageTimestamp = request.headers.get('twitch-eventsub-message-timestamp');
    const messageSignature = request.headers.get('twitch-eventsub-message-signature');

    // If headers are missing and a challenge is present (webhook verification)
    if ((!messageId || !messageTimestamp || !messageSignature) && payload.challenge) {
      console.log("Réception d'un challenge (headers absents)");
      return new Response(payload.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (!messageId || !messageTimestamp || !messageSignature) {
      throw new Error('Headers Twitch manquants');
    }

    const secret = process.env.TWITCH_WEBHOOK_SECRET; // Your Twitch client_secret

    // Verify Twitch signature
    const hmacMessage = messageId + messageTimestamp + rawBody;
    const hmac = crypto.createHmac('sha256', secret)
                       .update(hmacMessage)
                       .digest('hex');
    const expectedSignature = `sha256=${hmac}`;

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(messageSignature))) {
      return new Response('Signature invalide', { status: 403 });
    }

    // If the payload contains a challenge (webhook verification), return it
    if (payload.challenge) {
      return new Response(payload.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Process the event
    const event = payload.event;
    const eventType = request.headers.get('twitch-eventsub-subscription-type');
    console.log("Type d'événement:", eventType);
   
    const eventData = {
      ...event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };


    if (eventType === 'channel.subscribe' || eventType === 'channel.cheer' || eventType === 'channel.subscription.gift' || eventType === 'channel.bits.use' || eventType === 'channel.subscription.message') {
      const collectionName = 
        eventType === 'channel.subscribe' ? 'subs' :
        eventType === 'channel.cheer' ? 'cheers' :
        eventType === 'channel.subscription.gift' ? 'gifts' :
        eventType === 'channel.bits.use' ? 'bits' :
        eventType === 'channel.subscription.message' ? 'messages' :
        null;
      await db.collection(collectionName).add(eventData);
    } else {
      console.log('Événement non géré:', eventType);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Erreur:', error);
    return new Response('Erreur serveur', { status: 500 });
  }
}
