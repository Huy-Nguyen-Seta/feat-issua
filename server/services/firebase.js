const fcmHelper = require('../utils/fcm');
const {
  getFirebaseTokens,
  getManagerIdQuery
} = require('../query/firebase');

async function pushNotificationToPM({ req, requestId, screen }) {
  // Get the managerId of requesting user
  const userId = req.user.id;
  const managerQueryResult = await req.postgres.query(
    getManagerIdQuery({ userId })
  );
  if (!managerQueryResult) {
    console.error('Cannot find manager of current user.');
  }

  const {
    manager_id: managerId,
    name: username, badge_number: userBadgeNumber
  } = managerQueryResult.rows[0];

  if (!managerId) {
    console.error('Cannot find manager of current user.');
  }

  // Get the manager firebase tokens
  const tokenQuery = await req.postgres.query(
    getFirebaseTokens({ userId: managerId })
  );

  if (tokenQuery.rowCount > 0) {
    const tokens = [];
    tokenQuery.rows.forEach((item) => {
      tokens.push(item.firebase_token);
    });
    const title = `New request from ${username} ${userBadgeNumber}`;
    const body = 'Need review, approve or deny!';
    const data = {
      screen,
      id: requestId,
    };
    fcmHelper.sendNotification(tokens, title, body, data);
  } else {
    console.error('Cannot find firebase token of manager.');
  }
}

async function pushNotificationToUser({
  req, id, user_id: userId, screen
}) {
  // Get the user firebase tokens
  const tokenQuery = await req.postgres.query(
    getFirebaseTokens({ userId })
  );

  if (tokenQuery.rowCount > 0) {
    const tokens = [];
    tokenQuery.rows.forEach((item) => {
      tokens.push(item.firebase_token);
    });
    const title = 'Your request has been updated.';
    const body = 'Your request has been updated. Please open app to check.';
    const data = { screen, id };
    fcmHelper.sendNotification(tokens, title, body, data);
  } else {
    console.error('Cannot find firebase token of user.');
  }
}

module.exports = { pushNotificationToPM, pushNotificationToUser };
