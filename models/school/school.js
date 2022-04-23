const //importing
  mongoose = require("mongoose"),
  crypto = require("crypto"),
  jwt = require("jsonwebtoken"),
  // creating school schema
  schoolSchema = mongoose.Schema(
    {
      school_name: {
        type: String,
        required: [true, "school name is required"],
      },
      school_email: {
        type: String,
        required: true,
        unique: true,
      },
      cac_number: {
        type: String,
        required: true,
      },
      school_mobile: {
        type: String,
        default: "Please insert valid phone number",
        // required: [true, "school mobile is required"]
      },
      school_alt_mobile: {
        type: String,
        default: "Please insert valid alt phone number",
        // required: [true, "school alternative mobile is required"]
      },
      school_address: {
        type: String,
        default: "Please insert valid address",
        // required: [true, "school address is required"]
      },
      hash_password: { type: String, required: true },
      salt: { type: String, required: true },
      image: {
        file_path: String,
        file_url: String,
      },
      school_account: {
        remita_secret_key: { type: String, default: "" },
        remita_public_key: { type: String, default: "" },
        paystack_secret_key: { type: String, default: "" },
        paystack_public_key: { type: String, default: "" },
      },
      school_document: {
        file_path: String,
        file_url: String,
      },
      school_socials: [
        {
          title: String,
          url: String,
        },
      ],
      personnels: [
        {
          first_name: { type: String, required: true },
          middle_name: { type: String, default: "Nill" },
          last_name: { type: String, required: true },
          gender: { type: String, enum: ["male", "female"], required: true },
          personnel_id: { type: String, required: true },
          mobile: { type: String, required: true },
          hash_password: { type: String, required: true, select: false },
          salt: { type: String, required: true, select: false },
          date: { type: Date, default: Date.now() },
          hired_date: { type: Date },
          email: {
            type: String,
          },
          role: { type: String, required: true, lowercase: true },
          admin_title: {
            type: String,
            // required: function () {
            //   return this.role === "administrators";
            // },
          },
          active: { type: Boolean, default: false },
          on_leave: { type: Boolean, default: false },
          image: {
            file_path: { type: String, default: "" },
            file_url: { type: String, default: "" },
          },
          account: {
            salary: { type: String, default: "Nill" },
            bank: { type: String, default: "Nill" },
            account_number: { type: String, default: "Nill" },
          },
          state: { type: String, required: true },
          local_govt: { type: String, required: true },
          address: { type: String, default: "" },
          guarantor: {
            name: { type: String, default: null },
            email: { type: String, default: null },
            mobile: { type: String, default: null },
            address: { type: String, default: null },
          },
          documents: {
            file_path: { type: String, default: "" },
            file_url: { type: String, default: "" },
          },
        },
      ],
      students: [
        {
          first_name: { type: String, required: true },
          middle_name: { type: String, default: null },
          last_name: { type: String, required: [true, "Last Name Required"] },
          student_id: { type: String, required: true, unique: true },
          gender: { type: String, required: true },
          hash_password: { type: String, required: true },
          salt: { type: String, required: true },
          date: { type: Date, default: null },
          image: {
            file_path: { type: String, default: "" },
            file_url: { type: String, default: "" },
          },
          state: { type: String, default: null },
          default_image: { type: String, default: null },
          local_govt: { type: String, default: null },
          genotype: { type: String, default: null },
          blood_group: { type: String, default: null },
          address: { type: String, default: null },
          email: { type: String, required: true },
          mobile: { type: String, default: null },

          guardian: {
            first_name: { type: String, default: null },
            middle_name: { type: String, default: null },
            last_name: { type: String, default: null },
            mobile: { type: String, default: null },
            alt_mobile: { type: String, default: null },
            email: { type: String, default: null },
            occupation: { type: String, default: null },
            address: { type: String, default: null },
          },

          documents: {
            file_path: { type: String, default: "" },
            file_url: { type: String, default: "" },
          },

          academic: [
            {
              session: { type: String },
              class: { type: String, required: true },
              subclass: { type: String, required: true },
              term: [
                {
                  name: { type: String, required: true },
                  payment: {
                    status: { type: Boolean, default: false },
                    paymentType: { type: String, default: null },
                    seriaNumber: { type: String, default: null },
                    amountPaid: { type: Number, default: 0 },
                    dateOfPayment: { type: Date, default: null },
                  },
                  subjects: [
                    {
                      name: { type: String, required: true },
                      first_ca: { type: Number, default: 0 },
                      second_ca: { type: Number, default: 0 },
                      third_ca: { type: Number, default: 0 },
                      exam: { type: Number, default: 0 },
                    },
                  ],
                },
              ],
            },
          ],
          wallet: [
            {
              transaction_id: { type: String },
              ip_address: { type: String },
              currency: { type: String },
              channel: { type: String },
              domain: { type: String },
              reference: { type: String },
              transaction_date: { type: Date },
              paid_at: { type: Date },
              amount: { type: Number },
              credit: { type: Boolean, default: true },
            },
          ],
        },
      ],
      classes: [
        {
          name: { type: String, required: true, unique: true, uppercase: true },
          index: { type: Number, required: true },
          sub_class: [
            {
              name: { type: String, required: true },
              description: { type: String, default: null },
              subjects: [
                {
                  subject: { type: String },
                  code: { type: String },
                  tutor: {
                    first_name: { type: String },
                    last_name: { type: String },
                    id: { type: mongoose.ObjectId },
                  },
                },
              ],
            },
          ],
        },
      ],
      subclasses: [
        {
          sub_class_name: { type: String, require: true, unique: true },
          description: { type: String, require: true },
        },
      ],
      payment_setting: [
        {
          term: { type: String, required: true },
          arm: { type: String, required: true },
          requirements: [
            {
              description: { type: String, required: true },
              amount: { type: Number, required: true },
            },
          ],
        },
      ],
      form_group: [
        {
          name: { type: String, lowercase: true },
          description: { type: String, default: null },
          subjects: [
            {
              subject: { type: String },
              code: { type: String },
            },
          ],
        },
      ],
      subjects: [
        {
          subject: { type: String },
          code: { type: String },
          teachers: [
            {
              type: mongoose.Schema.Types.ObjectId,
              refPath: "personnels",
            },
          ],
        },
      ],
      sessions: [
        {
          batchname: { type: String, required: true },
          active: { type: Boolean, default: false },
          terms: [
            {
              term: { type: String, require: true },
              startdate: { type: Date, require: true },
              active: { type: Boolean, default: false },
              finished: { type: Boolean, default: false },
              enddate: { type: Date, require: true },
            },
          ],
        },
      ],
      hostels: [
        {
          block_name: { type: String, unique: true, require: true },
          number_of_rooms: { type: Number, default: 0 },
          number_of_individual_per_room: { type: Number, default: 0 },
          potter_name: { type: String, default: 0 },
          hostel_capacity: { type: Number, default: 0 },
          occuppied_space: { type: Number, default: 0 },
          rooms: [
            {
              room_name: { type: String, require },
              available_space: { type: Number, default: 0 },
              room_capacity: { type: Number, default: 0 },
              students: [
                {
                  id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "studentModel",
                  },
                },
              ],
            },
          ],
        },
      ],
      grades: [
        {
          start_score: { type: Number, required: true },
          end_score: { type: Number, required: true },
          score_title: { type: String, required: true },
        },
      ],
      email_setting: {
        sender_name: { type: String, default: "" },
        copy_email: { type: String, default: "" },
        broadcast_email: { type: String, default: "" },
        host: { type: String, default: "" },
        port: { type: String, default: "" },
        encryption: { type: String, default: null },
        username: { type: String, default: "" },
        password: { type: String, default: "" },
        email_sending: { type: Boolean, default: false },
      },
      leaves: [
        {
          personnel_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "schoolModel.personnels",
          },
          start_date: { type: Date },
          end_date: { type: Date },
          reason: { type: String },
          status: { type: Boolean, default: null },
        },
      ],
      fee_setting: [
        {
          name: { type: String, required: true, unique: true, uppercase: true },
          terms: [
            {
              name: { type: String, required: true, unique: true },
              payments: [
                {
                  name: { type: String, required: true },
                  amount: { type: Number, required: true },
                  date: { type: Date, required: true },
                },
              ],
            },
          ],
        },
      ],
    },
    { unique: true }
  );

schoolSchema.methods.createAdmin = function (param) {
  try {
    let objec = {};
    objec.salt = crypto.randomBytes(Math.ceil(16)).toString("hex");
    objec.admin_password = crypto
      .pbkdf2Sync(param.admin_password, objec.salt, 1000, 64, `sha512`)
      .toString(`hex`);
    objec.admin_email = param.admin_email;
    objec.admin_first_name = param.admin_first_name;
    objec.admin_last_name = param.admin_last_name;
    this.adminstrators.push(objec);
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addPersonnel = function (req) {
  return new Promise((resolve, reject) => {
    return this.findById(req.credentials._id)
      .exec()
      .then((result) => {
        if (!result) throw Error("Invalid School");
        let personnel_id = result.personnels.find((item) => {
          return (
            item.personnel_id == req.body.personnel_id ||
            item.email == req.body.email
          );
        });
        if (personnel_id) throw Error("personnel already exist");
        req.body.salt = crypto.randomBytes(Math.ceil(16)).toString("hex");
        // req.body.password = crypto.randomBytes(Math.ceil(8)).toString("hex");
        req.body.password = '123456';
        req.body.hash_password = crypto
          .pbkdf2Sync(req.body.password, req.body.salt, 1000, 64, `sha512`)
          .toString(`hex`);

        result.personnels.push(req.body);
        result.save();
        resolve({
          message: result,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
schoolSchema.statics.addPersonnels = function (req) {
  return new Promise((resolve, reject) => {
    return this.findById(req.credentials._id)
      .exec()
      .then((result) => {
        //test email
        if (!result) throw Error("Invalid School");
        for (const iterator of req.body) {
          let personnel_id = result.personnels.find((item) => {
            return (
              item.personnel_id == iterator.personnel_id ||
              item.email == iterator.email
            );
          });
          if (personnel_id) throw Error("personnel already exist");
          iterator.salt = crypto.randomBytes(Math.ceil(16)).toString("hex");
          iterator.password = crypto.randomBytes(Math.ceil(8)).toString("hex");
          iterator.hash_password = crypto
            .pbkdf2Sync(iterator.password, iterator.salt, 1000, 64, `sha512`)
            .toString(`hex`);

          result.personnels.push(iterator);
          //use email
        }
        result.save();
        resolve({
          message: "successfully created",
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
schoolSchema.statics.addStudent = function (req) {
  return new Promise((resolve, reject) => {
    return this.findById(req.credentials._id)
      .exec()
      .then((result) => {
        if (!result) throw Error("Invalid School");
        let student_id = result.students.find((item) => {
          return item.student_id == req.body.student_id;
        });
        if (student_id) throw Error("personnel already exist");
        req.body.salt = crypto.randomBytes(Math.ceil(16)).toString("hex");
        // req.body.password = crypto.randomBytes(Math.ceil(6)).toString("hex");
        req.body.password = '123456';
        req.body.hash_password = crypto
          .pbkdf2Sync(req.body.password, req.body.salt, 1000, 64, `sha512`)
          .toString(`hex`);
        result.students.push(req.body);

        result.save();
        resolve({
          message: req.body,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
schoolSchema.statics.addStudents = function (req) {
  return new Promise((resolve, reject) => {
    return this.findById(req.credentials._id)
      .exec()
      .then((result) => {
        //test email
        if (!result) throw Error("Invalid School");
        for (const iterator of req.body) {
          let student_id = result.students.find((item) => {
            return item.student_id == iterator.student_id;
          });
          if (student_id) throw Error("student already exist");
          iterator.salt = crypto.randomBytes(Math.ceil(16)).toString("hex");
          iterator.password = crypto.randomBytes(Math.ceil(8)).toString("hex");
          iterator.hash_password = crypto
            .pbkdf2Sync(iterator.password, iterator.salt, 1000, 64, `sha512`)
            .toString(`hex`);

          result.students.push(iterator);
          //use email
        }
        result.save();
        resolve({
          message: "successfully created",
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
schoolSchema.statics.addClass = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((result) => {
        if (!result) throw Error("Invalid School");
        let Class = result.classes.find((item) => {
          return item.class == paramTwo.class_name;
        });
        if (Class) throw Error("class Already Exist");
        result.classes.push(paramTwo);
        result.save();
        return "Class successfully created";
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addSubclass = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((result) => {
        let subclass = result.subclasses.find((item) => {
          return (item.sub_class_name = paramTwo.sub_class_name);
        });
        if (subclass) throw Error("subclass already exist");
        result.subclasses.push(paramTwo);
        result.save();
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addPaymentsetting = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        let data = res.payment_setting.find((i) => {
          return i.term == paramTwo.term && i.arm == paramTwo.arm;
        });
        if (data) {
          let description = data.payment_setting[0].requirements.find((i) => {
            return (i.description = paramTwo.requirements[0].description);
          });
          if (description) throw new Error("description already exist");
          data.payment_setting[0].requirements.push(paramTwo.requirements);
          res.save();
          return "successfully created";
        } else {
          res.payment_setting.push(paramTwo);
          res.save();
        }
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addAdministrator = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        let data = res.adminstrators.find((i) => {
          return i.admin_user_name == paramTwo.admin_user_name;
        });
        if (data) throw new Error("Username name already exist");
        paramTwo.salt = crypto.randomBytes(Math.ceil(16)).toString("hex");
        paramTwo.hash_password = crypto
          .pbkdf2Sync(paramTwo.password, paramTwo.salt, 1000, 64, `sha512`)
          .toString(`hex`);
        res.adminstrators.push(paramTwo);
        res.save;
        return "administrator created successfully";
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addSubject = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        let data = res.subjects.find((i) => {
          return (
            i.subject == paramTwo.subject ||
            i.subject_code == paramTwo.subject_code
          );
        });
        if (data) throw new Error("subject or suject code already exist");
        res.subjects.push(paramTwo);
        res.save;
        return "subject created successfully";
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addSession = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        let data = res.sessions.find((i) => {
          return i.start_year == paramTwo.year;
        });
        if (data) throw new Error("session already exist");
        let date = new Date();
        let year = date.getFullYear();
        if (year !== paramTwo.year) throw new Error("invalid year");
        let p = {};
        p.start_year = parseInt(param);
        p.end_year = parseInt(param) + 1;
        res.subjects.push(p);
        res.save;
        return "session created successfully";
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addHostel = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        let data = res.hostels.find((i) => {
          return i.block_name == paramTwo.block_name;
        });
        if (data) throw Error("Block already exist");
        paramTwo.hostel_capacity =
          paramTwo.number_of_individual_per_room * paramTwo.number_of_rooms;
        paramTwo.rooms = [];

        for (let i = 1; i <= paramTwo.number_of_rooms; i++) {
          paramTwo.rooms.push({
            room_name: `Room ${i}`,
            available_space: 0,
            room_capacity: number_of_individual_per_room,
          });
        }

        res.hostels.push(paramTwo);
        res.save();
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addSchoolAccount = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        if (Object.keys(res.school_account).length > 0)
          throw Error("your can only have one account details");
        res.school_account = paramTwo;
        res.save();
        return "successfully added school details";
      });
  } catch (error) {
    throw new Error(error.message);
  }
};
schoolSchema.statics.addTerm = function (paramOne, paramTwo) {
  try {
    return this.findById(paramOne)
      .exec()
      .then((res) => {
        if (Object.keys(res.school_account).length > 0)
          throw Error("your can only have one account details");
        res.school_account = paramTwo;
        res.save();
        return "successfully added school details";
      });
  } catch (error) {
    throw new Error(error.message);
  }
};

schoolSchema.statics.setPassword = function (password) {
  try {
    let salt = crypto.randomBytes(Math.ceil(16)).toString("hex"),
      hash_password = crypto
        .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
        .toString(`hex`);
    return {
      salt: salt,
      hash_password: hash_password,
    };
  } catch (error) {
    console.log(error);
  }
};
schoolSchema.statics.adminlogin = function (req) {
  return new Promise((resolve, reject) => {
    return this.findOne({ school_email: req.body.email })
      .exec()
      .then((result) => {
        if (!result) throw new Error("Invalid Credentials");
        let hash = crypto
          .pbkdf2Sync(req.body.password, result.salt, 1000, 64, `sha512`)
          .toString(`hex`);
        if (result.hash_password === hash) {
          let token = jwt.sign(
            {
              _id: result._id,
            },
            "aaa",
            {
              expiresIn: "3days",
            }
          );
          resolve({
            token: token,
          });
        } else {
          throw new Error("Invalid Credentials");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
schoolSchema.statics.studentlogin = function (req) {
  return new Promise((resolve, reject) => {
    return this.findOne({ _id: req.body._id })
      .exec()
      .then((result) => {
        if (!result) throw new Error("Invalid Credentials");
        console.log(result.salt);
        // let student = result.students.id(req.body.student_id);
        let student = result.students.find((i) => {
          return i.student_id == req.body.student_id;
        });

        if (!student) throw new Error("Invalid Credentials");

        let hash = crypto
          .pbkdf2Sync(req.body.credential, student.salt, 1000, 64, `sha512`)
          .toString(`hex`);

        if (student.hash_password === hash) {
          let token = jwt.sign(
            {
              _id: result._id,
              student_id: student._id,
            },
            "aaa",
            {
              expiresIn: "3days",
            }
          );
          resolve({
            token: token,
            data: student,
          });
        } else {
          throw new Error("Invalid Credentials");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
schoolSchema.methods.generatePassword = function () {
  try {
    let salt = crypto.randomBytes(Math.ceil(16)).toString("hex"),
      password = crypto.randomBytes(Math.ceil(10)).toString("hex"),
      hash_password = crypto
        .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
        .toString(`hex`);

    this.salt = salt;
    this.hash_password = hash_password;
    return password;
  } catch (error) {
    throw new Error(error);
  }
};

schoolSchema.methods.validPassword = function (password) {
  let hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return this.hash_password === hash;
};

//   exporting model
module.exports = mongoose.model("schoolModel", schoolSchema);
