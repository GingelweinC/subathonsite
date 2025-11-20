# Subathon Tracker — README (FR)

## 1. Description du projet

Ce projet est un outil conçu pour automatiser le calcul des gains générés lors d'un subathon Twitch et pour visualiser les contributions des spectateurs en temps réel. Il combine des données provenant de plusieurs sources pour fournir une vue d'ensemble complète des abonnements, bits, dons et autres contributions.

Caractéristiques principales :
- Suivi des abonnements, bits, dons et cadeaux en temps réel
- Intégration avec Twitch EventSub pour capturer les événements en direct
- Récupération des données depuis Streamlabs pour les dons
- Affichage interactif des données avec pagination et filtres
- Calcul automatique des totaux et des classements (Top donateurs, abonnés, etc.)

Technologies principales : JavaScript, HTML/CSS, Firebase Firestore, Twitch EventSub, Streamlabs API.

Objectif : fournir un tableau de bord interactif et facile à utiliser pour les streamers afin de suivre et analyser les contributions pendant un subathon.

## 2. Ce que j'ai appris

- **Gestion de données depuis plusieurs sources**
  - **Contexte** : Les données proviennent de Twitch (EventSub), Streamlabs et Firebase.
  - **Action** : Intégration de plusieurs APIs pour récupérer et synchroniser les données en temps réel.
  - **Résultat** : Une meilleure compréhension de la gestion des données multi-sources et de leur synchronisation.

- **Affichage des données et gestion des quotas**
  - **Contexte** : Les données doivent être affichées de manière claire et paginée, tout en respectant les quotas des APIs et des requêtes.
  - **Action** : Implémentation d'une pagination côté client et des filtres pour limiter les appels API.
  - **Résultat** : Une interface utilisateur fluide et optimisée pour les grandes quantités de données.

- **Twitch EventSub**
  - **Contexte** : Capturer les événements en temps réel, comme les abonnements et les bits.
  - **Action** : configuration des abonnements EventSub pour écouter les événements pertinents et les traiter dans l'application.
  - **Résultat** : Une compréhension approfondie de l'API EventSub et de son utilisation pour les extensions Twitch.

- **Données depuis Streamlabs**
  - **Contexte** : Les dons sont gérés via Streamlabs, nécessitant un overlay custom.
  - **Action** : Utilisation d'un overlay personnalisé sur le tableau de bord du streamer pour envoyer les dons à la base de données.
  - **Résultat** : Une expérience pratique avec l'intégration d'APIs tierces pour enrichir les fonctionnalités de l'application.

## 3. Comment exécuter et utiliser

L'application peut être utilisée directement en tant que tableau de bord pour les subathons Twitch. Voici les étapes pour la configurer et l'exécuter :

### Variables d'environnement

Créez un fichier `.env` ou configurez les variables d'environnement sur votre plateforme d'hébergement avec les valeurs suivantes :

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
```

### Exécution locale (développement)

1. Clonez le dépôt.
2. Installez les dépendances avec `npm install`.
3. Lancez l'application avec `npm start`.
4. Configurez un tunnel (par exemple, avec ngrok) pour recevoir les webhooks EventSub.
5. Créez un overlay personnalisé dans Streamlabs pour envoyer les dons à votre base de données.

## 4. Structure du projet

- `index.html`, `script.js`, `style.css` — Interface utilisateur principale
- `api/` — Gestion des webhooks EventSub et des appels API Streamlabs
- `public/` — Fichiers statiques (images, styles, etc.)
- `package.json` — Liste des dépendances et scripts de démarrage

## 5. Dépannage et notes

- Assurez-vous que toutes les variables d'environnement nécessaires sont définies avant de lancer l'application.
- Si vous utilisez EventSub, configurez correctement les redirections et les secrets pour sécuriser les webhooks.
- Vérifiez les quotas des APIs Twitch et Streamlabs pour éviter les erreurs dues à des limites dépassées.

## 6. Licence et crédits

Voir le fichier LICENSE pour les détails sur la licence.