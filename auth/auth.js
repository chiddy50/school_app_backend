"use strict";
const jwt = require("jsonwebtoken");

module.exports = class auth {
  constructor() {}
  static async adminauth(req, res, next) {
    try {
      let token = req.headers.auth.split(" ")[1];
      let data = await jwt.verify(token, "aaa");
      if (await data) {
        req.credentials = await data;
        next();
      } else {
        throw Error();
      }
    } catch (error) {
      res.status(401).json({
        error: "invalid_admin_token",
      });
    }
  }
};
