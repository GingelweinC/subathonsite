# Subathon Tracker — README (EN)

## 1. Project Description

This project is a tool designed to automate the calculation of earnings generated during a Twitch subathon and to visualize viewer contributions in real-time. It combines data from multiple sources to provide a comprehensive overview of subscriptions, bits, donations, and other contributions.

Key Features:
- Real-time tracking of subscriptions, bits, donations, and gifted subs
- Integration with Twitch EventSub to capture live events
- Retrieval of donation data from Streamlabs
- Interactive data display with pagination and filters
- Automatic calculation of totals and leaderboards (Top donors, subscribers, etc.)

Main Technologies: JavaScript, HTML/CSS, Firebase Firestore, Twitch EventSub, Streamlabs API.

Objective: Provide an interactive and user-friendly dashboard for streamers to track and analyze contributions during a subathon.

## 2. What I Learned

- **Managing Data from Multiple Sources**
  - **Context**: Data comes from Twitch (EventSub), Streamlabs, and Firebase.
  - **Action**: Integrated multiple APIs to fetch and synchronize data in real-time.
  - **Result**: Improved understanding of multi-source data management and synchronization.

- **Data Display and Quota Management**
  - **Context**: Data needs to be displayed clearly and paginated while respecting API quotas and request limits.
  - **Action**: Implemented client-side pagination and filters to minimize API calls.
  - **Result**: A smooth and optimized user interface for handling large amounts of data.

- **Twitch EventSub**
  - **Context**: Capture real-time events such as subscriptions and bits.
  - **Action**: Configured EventSub subscriptions to listen to relevant events and process them in the application.
  - **Result**: Gained a deep understanding of the EventSub API and its use for Twitch extensions.

- **Streamlabs Data**
  - **Context**: Donations are managed via Streamlabs, requiring a custom overlay.
  - **Action**: Used a custom overlay on the streamer's dashboard to send donations to the database.
  - **Result**: Hands-on experience with third-party API integration to enhance application features.

## 3. How to Run and Use

The application can be used directly as a dashboard for Twitch subathons. Here are the steps to configure and run it:

### Environment Variables

Create a `.env` file or configure environment variables on your hosting platform with the following values:

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

### Local Execution (Development)

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Start the application with `npm start`.
4. Set up a tunnel (e.g., using ngrok) to receive EventSub webhooks.
5. Create a custom overlay in Streamlabs to send donations to your database.

## 4. Project Structure

- `index.html`, `script.js`, `style.css` — Main user interface
- `api/` — Management of EventSub webhooks and Streamlabs API calls
- `public/` — Static files (images, styles, etc.)
- `package.json` — Dependency list and start scripts

## 5. Troubleshooting and Notes

- Ensure all required environment variables are set before starting the application.
- If using EventSub, configure redirects and secrets properly to secure webhooks.
- Check Twitch and Streamlabs API quotas to avoid errors due to exceeded limits.

## 6. License and Credits

See the LICENSE file for details on the license.