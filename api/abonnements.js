const admin = require('firebase-admin');
const axios = require('axios');

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
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ...firebaseConfig
});

const db = admin.firestore();

// Twitch configuration
const TWITCH_CONFIG = {
  CLIENT_ID: process.env.TWITCH_CLIENT_ID,
  CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
  BROADCASTER_ID: process.env.TWITCH_BROADCASTER_ID,
  WEBHOOK_SECRET: process.env.TWITCH_WEBHOOK_SECRET,
  CALLBACK_URL: process.env.TWITCH_CALLBACK_URL
};

async function clearExistingSubscriptions(accessToken) {
  try {
    // fetch existing subscriptions
    const response = await axios.get(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      {
        headers: {
          'Client-Id': TWITCH_CONFIG.CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const subscriptions = response.data.data;

    // Suppress existing subscriptions
    for (const sub of subscriptions) {
      await axios.delete(
        `https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`,
        {
          headers: {
            'Client-Id': TWITCH_CONFIG.CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      console.log(`Désabonnement réussi: ${sub.type}`);
    }

  } catch (error) {
    console.error('Erreur lors du nettoyage des abonnements:', error.response?.data || error.message);
  }
}

async function generateAndStoreToken() {
  try {
    console.log('\n=== Début de la génération du token ===');
    
    // Get app access token
    const authResponse = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: TWITCH_CONFIG.CLIENT_ID,
          client_secret: TWITCH_CONFIG.CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      }
    );

    const accessToken = authResponse.data.access_token;
    console.log('Token obtenu:', accessToken);
    await clearExistingSubscriptions(accessToken);
    // Stock in Firebase
    const tokenRef = db.collection('tokens').doc('appaccesstoken');

await tokenRef.set({
  token: accessToken,
  timestamp: admin.firestore.FieldValue.serverTimestamp()
}, { merge: true });
    console.log('Token stocké dans Firebase');

    // Manage EventSub subscriptions
    const events = [
      'channel.subscribe', 
      'channel.cheer',  
      'channel.subscription.gift', 
      'channel.subscription.message',
      'channel.bits.use'
    ];

    for (const eventType of events) {
      try {
        await axios.post(
          'https://api.twitch.tv/helix/eventsub/subscriptions',
          {
            type: eventType,

            version: eventType === 'channel.bits.use' ? 'beta' : '1',
            condition: {
              broadcaster_user_id: TWITCH_CONFIG.BROADCASTER_ID
            },
            transport: {
              method: 'webhook',
              callback: TWITCH_CONFIG.CALLBACK_URL,
              secret: TWITCH_CONFIG.WEBHOOK_SECRET
            }
          },
          {
            headers: {
              'Client-Id': TWITCH_CONFIG.CLIENT_ID,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`Abonnement ${eventType} réussi`);
      } catch (error) {
        console.error(`Erreur avec ${eventType}:`, error.response?.data || error.message);
      }
    }

    console.log('=== Cycle terminé ===\n');
  } catch (error) {
    console.error('ERREUR GLOBALE:', error.response?.data || error.message);
  }
}

module.exports = async (req, res) => {
  await generateAndStoreToken();
  res.status(200).json({ message: 'EventSub mis à jour' });
};
