const admin = require('firebase-admin');
const axios = require('axios'); 

// Firebase Configuration 
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
  databaseURL: "https://subathon-8a47c.firebaseio.com"
});

const docRef = admin.firestore().collection('variables').doc('tokens');

// Fonction to get tokens from Firestore
async function getTokens() {
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log("Création des tokens initiaux...");
    const initialTokens = {
      accessToken: '9an4y24kztktb126ddkkpkd1ptpeoi',
      refreshToken: '6pptiyt2evwimt1jfxtmj06v03kwxntmuyfubqae0475xbjjhe'
    };
    await docRef.set(initialTokens);
    return initialTokens;
  }
  return doc.data();
}

// Fonction to refresh the token
async function refreshToken(refreshToken) {
  const params = new URLSearchParams();
  params.append('client_id', process.env.TWITCH_CLIENT_ID);
  params.append('client_secret',  process.env.TWITCH_CLIENT_SECRET); 
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error.response?.data || error.message);
    throw error;
  }
}


module.exports = async (req, res) => {
  try {
    const tokens = await getTokens();

    const newTokens = await refreshToken(tokens.refreshToken);

    await docRef.update({
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token,
      expiresIn: newTokens.expires_in,
      obtainmentTimestamp: Date.now()
    });

    res.status(200).send('Token rafraîchi avec succès !');
  } catch (error) {
    console.error("ERREUR:", error);
    res.status(500).send(`Erreur: ${error.message}`);
  }
};