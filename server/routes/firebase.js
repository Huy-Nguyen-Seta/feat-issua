const router = require('express').Router();
const named = require('yesql').pg;

const apiRoutes = require('../../apiRoute.json');

/**
 * Register new Firebase registration token for a user
 * request params:
 * @param token firebase registration token
 */
router.post(apiRoutes.registerFirebaseToken, async (req, res) => {
  try {
    // add new token for the user
    const { firebaseToken } = req.body;

    let existed = false;
    const existedEntries = await req.postgres.query(named(`
        select user_id from "firebase" where firebase_token=:firebaseToken`)({
      firebaseToken
    }));
    if (existedEntries.rowCount === 0) {
      await req.postgres.query(named(`
          insert into "firebase" (user_id, firebase_token)
          VALUES (:userId, :firebaseToken)
          returning *`)({
        userId: req.user.id,
        firebaseToken
      }));
    } else {
      existed = true;
    }

    res.status(200).json({
      success: true,
      inserted: !existed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString()
    });
  }
});

module.exports = router;
