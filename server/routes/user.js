const router = require('express').Router();
const named = require('yesql').pg;
const moment = require('moment-timezone');

const apiRoute = require('../../apiRoute.json');
const {
  idValidation, encryptData, registerValidation,
  putUserInfoValidation, getUserValidation
} = require('../validations/validation');
const {
  getErrorResponse,
  getSuccessResponse
} = require('../helper/handle-response');
const { getUserRow, getUserInfo } = require('../helper/user');
const { camelCaseData } = require('../helper/calculation');
const { getAllUserInfoService } = require('../services/user.service');
const { userValidation } = require('../validations');
const validate = require('../middlewares/validate');
const { userController } = require('../controllers');
const { userQuery } = require('../query');
const { imageUploader } = require('../middlewares/upload');
const { insertUserLeave } = require('../query/userLeave.query');
const { insertWorkTimeQuery } = require('../query/admin.query');

// Get information of current active user
router.get(apiRoute.getUserInfo, async (req, res) => {
  const { id } = req.user || {};
  const { error } = idValidation({ id });
  if (error) return getErrorResponse(res, 401);

  try {
    // Find user info by id
    const user = await getUserRow(req, 'id', id);
    if (!user.rowCount) return getErrorResponse(res, 404, 'Not found.');

    const data = getUserInfo(user.rows[0]);

    // Send user info when success
    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get information of all users
router.get(apiRoute.getUserForAdmin, async (req, res) => {
  const { error } = getUserValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: errorData } = await getAllUserInfoService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.register, async (req, res) => {
  // Validate input request
  const { error } = registerValidation(req.body);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const {
      email, password, roleId, badgeNumber, hiredDate
    } = req.body;

    // Check if email or badgeNumber exists or not
    const user = await req.postgres.query(named(`
    select * from "user" where email = :email or badge_number = :badgeNumber`)(
      { email, badgeNumber }
    ));
    if (user.rowCount > 0) {
      return getErrorResponse(res, 409, 'This user info already exists.');
    }

    // Find role name by title (role id)
    const role = await req.postgres.query(named(`
    select name from role where id = :roleId`)({ roleId }));
    if (!role.rowCount) getErrorResponse(res, 500, 'Cannot create user.');

    const hashedPassword = await encryptData(password);

    await req.postgres.query('BEGIN');

    // Save user in user table, set title = role name
    const savedUser = await req.postgres.query(userQuery.insertUserQuery({
      ...req.body,
      title: role.rows[0].name,
      password: hashedPassword,
    }));
    const { id } = savedUser.rows[0];

    // insert user work_time
    const currentDate = `${moment().add(1, 'days').format('YYYY-MM-DD')}T00:00:00.000Z `;

    const defaultWorkTime = {
      userId: id,
      fromDate: currentDate,
      fromTime: '01:30:00',
      toTime: '10:30:00',
      startBreakTime: '05:00:00',
      endBreakTime: '06:00:00',
      description: '',
    };
    const workTime = await req.postgres.query(
      insertWorkTimeQuery({ ...defaultWorkTime })
    );
    if (!workTime.rowCount) {
      return getErrorResponse(res, 500, 'Cannot create user work time.');
    }
    // insert user leave;
    const hiredDateObj = new Date(hiredDate);
    const yearNow = new Date().getUTCFullYear();
    const hiredMonth = hiredDateObj.getUTCMonth() + 1; // months from 1-12
    const hiredday = hiredDateObj.getUTCDate();

    let totalLeave = 12;
    let totalRemain = 12;
    let carryOver = 12;
    let carryOverRemain = 12;

    if (yearNow - hiredDateObj.getFullYear() === 1) {
      totalLeave = 12;
      totalRemain = 12;
      carryOver = 12 - hiredMonth;
      if (hiredday <= 10) {
        carryOver += 1;
      } else if (hiredday <= 20) {
        carryOver += 0.5;
      }
      carryOverRemain = carryOver;
    } else if (yearNow - hiredDateObj.getFullYear() === 0) {
      totalLeave = 12 - hiredMonth;
      if (hiredday <= 10) {
        totalLeave += 1;
      } else if (hiredday <= 20) {
        totalLeave += 0.5;
      }
      totalRemain = totalLeave;
      carryOver = 0;
      carryOverRemain = 0;
    }

    await req.postgres.query(insertUserLeave({
      totalLeave: totalLeave * 8,
      totalRemain: totalRemain * 8,
      carryOver: carryOver * 8,
      carryOverRemain: carryOverRemain * 8,
      userId: id,
      year: yearNow,
    }));

    // Save user in user_role table

    const savedUserRole = await req.postgres.query(named(`
    insert into user_role (user_id, role_id)
    VALUES (:id, :roleId) returning *`)({ id, roleId }));

    await req.postgres.query('COMMIT');

    if (!savedUserRole.rowCount || !savedUser.rowCount) return getErrorResponse(res, 500, 'Cannot create user.');

    getSuccessResponse(res, 200, { data: { id } });
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(apiRoute.role, async (req, res) => {
  try {
    // Find user role
    const role = await req.postgres.query(named('select * from role')({}));
    if (!role.rowCount) return getErrorResponse(res, 404);

    const data = camelCaseData(role.rows);

    // Send user info when success
    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(apiRoute.manager, async (req, res) => {
  try {
    const manager = await req.postgres.query(`
    select u.id, u.name, u.badge_number, u.title from "user" u
    join user_role ur on ur.user_id = u.id
    join role r on r.id = ur.role_id
    where r.name = 'manager' or r.name = 'admin'`);
    if (!manager.rowCount) return getErrorResponse(res, 404);

    const data = camelCaseData(manager.rows);

    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(`${apiRoute.user}/:id`, async (req, res) => {
  // Validate input
  const { id } = req.params;
  const { error } = putUserInfoValidation({ id, ...req.body });
  if (error) return res.status(400).send({ error: error.details[0] });

  try {
    const {
      name, email, password, hiredDate, badgeNumber,
      status, gender, roleId, birthDay, phone, address, managerId
    } = req.body;

    // Check if email or badgeNumber exists or not
    if (badgeNumber || email) {
      const user = await req.postgres.query(named(`
      select email, badge_number from "user" where id = :id limit 1`)({ id }));
      const {
        email: currentEmail,
        badge_number: currentBadgeNumber
      } = user.rows[0];

      const duplicateUser = await req.postgres.query(named(`
      select * from "user" 
      where (email = :email or badge_number = :badgeNumber) 
      and (email != :currentEmail or badge_number = :currentBadgeNumber )`)({
        email,
        badgeNumber,
        currentEmail,
        currentBadgeNumber
      }));

      if (duplicateUser.rowCount > 0) {
        return getErrorResponse(res, 409, 'This user info already exists.');
      }
    }

    // Update user info
    let set = 'modified_date_time = :modifiedDateTime';

    if (name) set += ', name = :name';
    if (email) set += ', email = :email';
    if (hiredDate) set += ', hired_date = :hiredDate';
    if (badgeNumber) set += ', badge_number = :badgeNumber';
    if (status) set += ', status = :status';
    if (gender) set += ', gender = :gender';
    if (birthDay) set += ', birth_day = :birthDay';
    if (phone) set += ', phone = :phone';
    if (address) set += ', address = :address';
    if (managerId) set += ', manager_id = :managerId';

    let hashedPassword = '';
    if (password) {
      hashedPassword = await encryptData(password);
      if (!hashedPassword) getErrorResponse(res, 500);

      delete req.body.password;
      set += ', password = :password';
    }

    await req.postgres.query('BEGIN');

    let role = '';
    if (roleId) {
      // Find role name by roleId
      role = await req.postgres.query(named(`
      select name from role where id = :roleId limit 1`)({ roleId }));
      if (!role.rowCount) getErrorResponse(res, 500);

      delete req.body.roleId;
      req.body.title = role.rows[0].name;
      set += ', title = :title';

      const result1 = await req.postgres.query(named(`
      update "user_role" set role_id = :roleId where user_id = :id`)(
        { roleId, id }
      ));
      if (!result1.rowCount) return getErrorResponse(res, 500);
    }

    const modifiedDateTime = new Date().toISOString();
    const result = await req.postgres.query(named(`
    update "user" set ${set} where id = :id`)(
      {
        modifiedDateTime,
        password: hashedPassword,
        id,
        ...req.body,
      }
    ));

    await req.postgres.query('COMMIT');

    if (!result.rowCount) return getErrorResponse(res, 500);

    getSuccessResponse(res, 200, { data: { ...req.body, modifiedDateTime } });
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(
  apiRoute.password,
  validate(userValidation.updatePassword),
  userController.updatePassword
);

// Router for client to register 5 biometric images for new user
router.post(apiRoute.registerBiometric,
  imageUploader.array('images', 5),
  userController.multipleUpload);

module.exports = router;
