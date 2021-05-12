"use strict";

let nodemailer = require("nodemailer"),
  hbs = require("handlebars"),
  cred = require("./credentails"),
  path = require("path"),
  fs = require("fs");

module.exports = class mailer {
  constructor() {}
  static async createTransporter(cred) {
    let secure = false;
    console.log(cred);
    if (cred.encryption == "true") {
      secure = true;
    }
    let transporter = await nodemailer.createTransport({
      host: cred.host,
      port: cred.port,
      secure: secure,
      auth: {
        user: cred.username,
        pass: cred.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return transporter;
  }
  static async templatecompiler(router) {
    let source = fs.readFileSync(router, "utf8");
    let template = hbs.compile(source);
    return template;
  }
  static async studentConfirmationMail(param, cred) {
    let transporter = await this.createTransporter(cred),
      template = await this.templatecompiler("./views/create_student.hbs");

    let mailOptions = {
        from: `${cred.sender_name} <${cred.username}>`,
        to: param.email,
        cc: cred.copy_email,
        bcc: cred.broadcast_email,
        subject: param.subject,
        html: template({
          name: param.name,
          password: param.password,
          id: param.id,
        }),
      },
      result = await transporter.sendMail(mailOptions);
    return result;
  }
  static async verifyMailsetting(param, cred) {
    let transporter = await this.createTransporter(cred),
      template = await this.templatecompiler("./views/test_mail.hbs");

    let mailOptions = {
        from: `${cred.sender_name} <${cred.username}>`,
        to: param,
        cc: cred.copy_email,
        bcc: cred.broadcast_email,
        subject: "Mail Testing",
        html: template(),
      },
      result = await transporter.sendMail(mailOptions);
    console.log(result);
    return result;
  }
};
