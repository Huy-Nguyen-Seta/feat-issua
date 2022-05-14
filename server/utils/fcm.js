/**
 * This helpder contains utility functions for
 * working with Firebase Cloud Messaging stuffs
 */

// The admin sdk
const admin = require('firebase-admin');
// TODO this is insecure, as in https://firebase.google.com/docs/admin/setup
// move to environment variable instead
const serviceAccount = require('../../firebase_adminsdk_info.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://seta-timesheet-8888.firebaseio.com'
});

/**
 * This function create a Firebase push notification
 * to multiple devices with registered token
 * @param {list of strings} firebaseTokens list of tokens that devices
 * previously registered with server
 * @param {string} title title of notification
 * @param {string} body body of notification
 * @param {json object} data message data json object
 * E.g: {title: '850', body: '2:45', payload},
 * @returns {}
 * Note: because Timesheet mobile apps are written with
 * Flutter, this function auto add
 * {click_action: FLUTTER_NOTIFICATION_CLICK}
 * into the notification message, as specified here
 * https://pub.dev/packages/firebase_messaging
 * Note: For send a data message, use @function sendDataMessage
 */
async function sendNotification(firebaseTokens, title, body, data) {
  const dat = data;
  dat.click_action = 'FLUTTER_NOTIFICATION_CLICK';
  const outMsg = {
    notification: {
      title,
      body
    },
    data: dat,
    tokens: firebaseTokens
  };
  const response = await admin.messaging().sendMulticast(outMsg);
  console.log(`${response.successCount} messages were sent successfully`);
}

module.exports = { sendNotification };
