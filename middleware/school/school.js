"use strict";
const //imports
  schoolModel = require("../../models/school/school"),
  mailer = require("../../mailer/mailer"),
  axios = require("axios"),
  // np = require("../../Nursery&Primary/nursery&primary"),
  // ss = require("../../secondary/secondary"),
  fs = require("fs"),
  roleModel = require("../../models/role/role");

module.exports = class school {
  constructor() {}

  // school
  static async createNewSchool(req, res) {
    try {
      let rb = req.body;
      // console.log(rb);
      // rb.classes = [];
      // let findprimary = await rb.type.find((item) => {
      //   return item.code === "1";
      // });
      // let findsecondary = await rb.type.find((item) => {
      //   return item.code === "2";
      // });
      // if (findprimary) {
      //   rb.classes = [...np];
      // }
      // if (findsecondary) {
      //   rb.classes = [...rb.classes, ...ss];
      // }
      let findSchool = await schoolModel.findOne({
        cac_number: rb.cac_number,
      });
      if (findSchool) throw Error("School Already Exist");
      // let emailer = await mail.testconnection();
      let data = await schoolModel(rb);
      rb.pasword = await data.generatePassword();
      let result = await data.save();
      console.log(rb);

      // await mailer.main(emailer, result);
      if (await result) {
        res.status(200).json({
          message: `${rb.school_name} created Successfully`,
        });
      }
    } catch (error) {
      // if (error.code == 11000) {
      // 	error.message = 'Email has already been taken';
      // }
      console.log(error);

      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async createNewSchools(req, res) {
    try {
      // let emailer = await mail.testconnection();
      for (const iterator of req.body) {
        let findSchool = await schoolModel.findOne({
          cac_number: iterator.cac_number,
        });

        if (findSchool) throw Error("School Already Exist");
        let data = await schoolModel(iterator);
        rb.pasword = await data.generatePassword();
        await data.save();
        let message = {
          email: data.email,
          password: rb.password,
        };
        console.log(message);
        // await mailer.main(emailer, result);
      }
      res.status(200).json({
        message: `Schools created Successfully`,
      });
    } catch (error) {
      if (error.code == 11000) {
        error.message = "Email has already been taken";
      }

      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getAllSchools(req, res) {
    try {
      let search = {};
      let limit = 20;
      limit = Number.parseInt(limit);
      let currentpage = req.headers.currentpage || 1;
      currentpage = Number.parseInt(currentpage);
      if (req.headers.search) {
        let regex = new RegExp(req.headers.search, "i");
        search = { school_name: { $in: regex } };
      }
      let data = await schoolModel
        .find(search)
        .select("_id school_name")
        .sort({ _id: -1 })
        .skip(currentpage * limit - limit)
        .limit(limit);
      let count = await schoolModel.find(search).countDocuments();
      res.status(200).json({
        message: {
          data: data,
          row: count,
          perpage: limit,
          currentpage: currentpage,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getSchoolDetails(req, res) {
    try {
      let data = await schoolModel.findById(req.headers.id);
      if (data) {
        res.status(200).json({
          message: data,
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addsubclass(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("classes form_group");
      let mainclass = await data.classes.id(req.headers.class_id);
      let mainsubclass = await mainclass.sub_class.find((item) => {
        return item.name === req.body.name;
      });
      if (mainsubclass) throw Error("subclass already Exist");
      let getsubjects = data.form_group.id(req.body.value._id);

      await mainclass.sub_class.push({
        name: req.body.name,
        description: req.body.description,
        subjects: getsubjects.subjects,
      });
      await data.save();
      res.status(200).json({
        message: "Successfully Created",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletesubclass(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("classes");
      let mainclass = await data.classes.id(req.headers.class_id);
      await mainclass.sub_class.id(req.body.subclass_id).remove();
      await data.save();
      res.status(200).json({
        message: "Successfully Created",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async addclass(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("classes fee_setting");
      let mainclass = await data.classes.find((i) => {
        return i.name == req.body.name || i.index == req.body.index;
      });

      if (mainclass) throw Error("subclass already Exist");
      await data.classes.push(req.body);
      await data.fee_setting.push({
        name: req.body.name,
        terms: [
          {
            name: "First Term",
          },
          {
            name: "Second Term",
          },
          {
            name: "Third Term",
          },
        ],
      });
      await data.save();

      res.status(200).json({
        message: "Successfully Created",
        data: data.classes,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async addfeesetting(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting")
        .orFail("School doesn'T exist");

      let result = await data.fee_setting.id(req.body.class_id);
      if (!result) throw Error("class doesn't exist");

      let payment = await result.terms.id(req.body.term_id);
      if (!payment) throw Error("class doesn't exist");

      let itemcheck = await payment.payments.find((i) => {
        return i.name.toLowerCase() == req.body.name;
      });

      if (itemcheck) throw Error("Item Already Exist");

      await payment.payments.push({
        name: req.body.name,
        amount: req.body.amount,
        date: req.body.date,
      });

      await data.save();
      data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting")
        .orFail("School doesn'T exist");

      res.status(200).json({
        message: "Added Successfully",
        data: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async editfeesetting(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting")
        .orFail("School doesn't exist");

      let result = await data.fee_setting.id(req.body.class_id);
      if (!result) throw Error("class doesn't exist");

      let payment = await result.terms.id(req.body.term_id);
      if (!payment) throw Error("class doesn't exist");

      let item = await payment.payments.id(req.body.payment_id);
      item.name = req.body.name;
      item.amount = req.body.amount;
      item.date = req.body.date;

      await data.save();
      data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting")
        .orFail("School doesn'T exist");

      res.status(200).json({
        message: "Edited Successfully",
        data: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletefeesetting(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting")
        .orFail("School doesn't exist");

      let result = await data.fee_setting.id(req.body.class_id);
      if (!result) throw Error("class doesn't exist");

      let payment = await result.terms.id(req.body.term_id);
      if (!payment) throw Error("class doesn't exist");

      await payment.payments.id(req.body.payment_id).remove();

      await data.save();
      data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting")
        .orFail("School doesn'T exist");

      res.status(200).json({
        message: "Deleted Successfully",
        data: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async getfeesetting(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("fee_setting");
      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getclasses(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("classes._id classes.name");
      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getAllclasses(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);

      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getclassDetails(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .orFail(new Error("doesn't exist"));
      let result = await data.classes.id(req.headers.class_id);
      res.status(200).json({
        message: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  // cac documents
  static async uploadschoollogo(req, res) {
    try {
      let data = await schoolModel.findById(req.headers.id);
      if (await data) {
        let path = req.file.path;
        data.image = {
          file_path: path,
          file_url: `${req.protocol}://${req.headers.host}/${path}`,
        };
        await data.save();
        res.status(200).json({
          message: "Image Successfully Upload",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async uploadcacdocument(req, res) {
    try {
      let data = await schoolModel.findById(req.headers.id);
      if (await data) {
        let path = req.file.path;
        data.school_document = {
          file_path: path,
          file_url: `${req.protocol}://${req.headers.host}/${path}`,
        };
        await data.save();
        res.status(200).json({
          message: "Document Successfully Uploaded",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async editcacdocument(req, res) {
    try {
      let data = await schoolModel.findById(req.headers.id);
      if (await data) {
        let path = req.file.path;
        fs.unlinkSync(data.school_document.file_path);
        data.school_document = {
          file_path: path,
          file_url: `${req.protocol}://${req.headers.host}/${path}`,
        };
        await data.save();
        res.status(200).json({
          message: "Document Successfully Editted",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletecacdocument(req, res) {
    try {
      let data = await schoolModel.findById(req.headers.id);
      if (await data) {
        fs.unlinkSync(data.school_document.file_path);
        data.school_document = undefined;
        await data.save();
        res.status(200).json({
          message: "Document Successfully Deleted",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async downloadschooltemplate(req, res) {
    try {
      res.status(200).json({
        message: [
          {
            school_name: "Example Nusery & Primary School",
            school_email: "example@cirportal.com",
            school_mobile: "+234-8100000000",
            cac_number: "RC45675847",
            school_alt_mobile: "+234-7100000000",
            school_address: "#2 cirportal Complex",
          },
        ],
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  // edit school
  static async updateschoolinfo(req, res) {
    try {
      let data = await schoolModel.findOneAndUpdate(
        { _id: req.headers.id },
        req.body
      );
      if (data) {
        res.status(200).json({
          message: "School Information Successfully Updated",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updateschoolaccount(req, res) {
    try {
      let data = await schoolModel.findById(req.headers.id);
      if (!data) throw Error("Invalid School");
      data.school_account = req.body;
      let result = await data.save();
      if (result) {
        res.status(200).json({
          message: "School Account Successfully Updated",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  // admin login
  static async adminlogin(req, res) {
    try {
      let data = await schoolModel.adminlogin(req);

      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }
  static async studentlogin(req, res) {
    try {
      let data = await schoolModel.studentlogin(req);

      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }
  static async verify_credential(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .orFail(new Error("School Does not exist"));

      let result = await data.validPassword(req.body.credential);

      res.status(200).json({
        message: result,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }
  static async verifyEmailSettings(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("email_setting");
      let result = await mailer.verifyMailsetting(
        req.body.email,
        data.email_setting
      );
      console.log(result);
      res.status(200).json({
        message: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  //add personnel
  static async addPersonnel(req, res) {
    try {
      console.log(req.body);
      let role = await roleModel.findOne({ name: req.body.role.toLowerCase() });
      let checkrole =
        req.body.role == "teachers" || req.body.role == "administrators";
      console.log(role, checkrole);
      if (!role && !checkrole) {
        role = await roleModel({ name: req.body.role.toLowerCase() });
        await role.save();
      }
      let data = await schoolModel.addPersonnel(req);
      let newid = data.message.personnels.find((i) => {
        return i.personnel_id == req.body.personnel_id;
      });
      let tag = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects");
      for (const iterator of req.body.subjectIds) {
        let subject = tag.subjects.find((i) => {
          return i._id == iterator;
        });
        if (subject) {
          subject.teachers.push(await newid._id);
        }
      }
      await tag.save();
      if (await data) {
        res.status(200).json({
          message: "Successfully Created",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addPersonnels(req, res) {
    try {
      let data = await schoolModel.addPersonnels(req);
      if (await data) {
        res.status(200).json({
          message: "Successfully Created",
        });
      }
    } catch (error) {
      if (error.code == 11000) {
        error.message = "Email has already been taken";
      }

      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async getPersonnels(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select(
          "-_id personnels._id personnels.first_name personnels.last_name personnels.personnel_id personnels.role personnels.admin_title personnels.image.file_url"
        );

      res.status(200).json({
        message: {
          data: data.personnels,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getPersonnel(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      let result = await data.personnels.id(req.headers.personnel_id);

      res.status(200).json({
        message: {
          data: result,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async activatePersonnel(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      let result = await data.personnels.id(req.body.personnel_id);
      result.active = true;
      await data.save();

      data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      result = await data.personnels.id(req.body.personnel_id);

      res.status(200).json({
        message: "Personnel Activated successfully",
        data: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updatePersonnelAcoount(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      let result = await data.personnels.id(req.headers.personnel_id);
      result.account = req.body;
      await data.save();

      data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      result = await data.personnels.id(req.headers.personnel_id);

      res.status(200).json({
        message: "Personnel Account Updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deactivatePersonnel(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      let result = await data.personnels.id(req.body.personnel_id);
      result.active = false;
      await data.save();

      data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels");
      result = await data.personnels.id(req.body.personnel_id);

      res.status(200).json({
        message: "Personnel Deactivated successfully",
        data: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async downloadpersonneltemplate(req, res) {
    try {
      res.status(200).json({
        message: [
          {
            first_name: "John",
            middle_name: "Jame",
            last_name: "Doe",
            gender: "male",
            mobile: "+234-7100000000",
            email: "example@cirportal.com",
            role: "academic",
            state: "Delta",
            local_govt: "Ndokwa West",
            address: "#2 cirportal Complex",
          },
        ],
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async uploadpersonneldocument(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");
      let result = await data.personnels.id(req.headers.id);
      let path = req.file.path;
      let object = {
        file_path: path,
        file_url: `${req.protocol}://${req.headers.host}/${path}`,
      };
      result.documents = object;

      await data.save();
      res.status(200).json({
        message: "Document Successfully Uploaded",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async addpersonnelguarantor(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");
      let result = await data.personnels.id(req.headers.personnel_id);
      if (!result) throw new Error("Staff Doesnot Exist");
      result.guarantor = req.body;
      await data.save();

      data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");
      result = await data.personnels.id(req.headers.personnel_id);

      res.status(200).json({
        message: "Guarantor Successfully Added",
        data: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }

  static async deletepersonneldocument(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");
      let result = await data.personnels.id(req.headers.id);
      fs.unlinkSync(result.documents.file_path);
      result.documents = {
        file_path: "",
        file_url: "",
      };
      await data.save();

      await data.save();
      res.status(200).json({
        message: "Document Successfully Uploaded",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updatepersonnelimage(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");

      let result = await data.personnels.id(req.headers.id);
      let path = req.file.path;
      let object = {
        file_path: path,
        file_url: `${req.protocol}://${req.headers.host}/${path}`,
      };
      console.log(object);

      result.image = object;
      await data.save();
      res.status(200).json({
        message: "Document Successfully Uploaded",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletepersonnelimage(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");

      let result = await data.personnels.id(req.headers.id);

      fs.unlinkSync(result.image.file_path);
      result.image = undefined;
      await data.save();
      res.status(200).json({
        message: "Document Successfully deleted",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletepersonnel(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");

      let result = await data.personnels.id(req.headers.id);
      if (result.personnel_id != req.headers.personnel_id)
        throw Error("Invalid Personnel ID");
      if (result.image.file_path) {
        fs.unlinkSync(result.image.file_path);
      }
      if (result.documents.file_path) {
        fs.unlinkSync(result.documents.file_path);
      }
      await result.remove();
      await data.save();
      res.status(200).json({
        message: "Document Successfully deleted",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  // add session
  static async addSession(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .orFail(new Error("School doesnt exist"));
      let currentsesion = await data.sessions.find((item) => {
        return item.start_year == req.body.year;
      });
      if (currentsesion) throw new Error("sesion already exist");
      let date = new Date();
      let year = date.getFullYear();
      if (year !== req.body.year) throw new Error("invalid year");
      let p = {};
      p.start_year = parseInt(year);
      p.end_year = parseInt(year) + 1;
      await data.sessions.push(p);
      await data.save();
      res.status(200).json({
        message: "Session successfully created",
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async addStudent(req, res) {
    try {
      let d = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions email_setting");
      let session = await d.sessions.find((item) => {
        return item.active;
      });
      let term = await session.terms.find((item) => {
        return item.active;
      });
      req.body.academic = [
        {
          session: session.batchname,
          class: req.body.class,
          subclass: req.body.subclass,
          term: [
            {
              name: term.term,
            },
          ],
        },
      ];

      let data = await schoolModel.addStudent(req);
      console.log(data);

      if (await data) {
        mailer.studentConfirmationMail(
          {
            email: data.message.email,
            subject: "Student Creation",
            name: `${data.message.first_name} ${data.message.last_name}`,
            password: data.message.password,
            id: data.message.student_id,
          },
          d.email_setting
        );
        res.status(200).json({
          message: "Successfully Created",
        });
      }
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updateStudentInfo(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("students");
      let student = data.students.id(req.body.student_id);
      if (!student) throw new Error("student doesn't exist");

      student.first_name = req.body.first_name;
      student.middle_name = req.body.middle_name;
      student.last_name = req.body.last_name;
      student.mobile = req.body.mobile;
      student.gender = req.body.gender;
      student.date = req.body.date;
      student.email = req.body.email;
      student.state = req.body.state;
      student.local_govt = req.body.local_govt;
      student.address = req.body.address;

      await data.save();

      let result = await data.students.id(req.body.student_id);
      res.status(200).json({
        message: "Successfully Created",
        data: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updateStudentGuardian(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("students");
      let student = data.students.id(req.body.student_id);
      if (!student) throw new Error("student doesn't exist");
      student.guardian = {
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        mobile: req.body.mobile,
        alt_mobile: req.body.alt_mobile,
        email: req.body.email,
        occupation: req.body.occupation,
        address: req.body.address,
      };
      await data.save();

      let result = await data.students.id(req.body.student_id);
      res.status(200).json({
        message: "Successfully Created",
        data: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addStudents(req, res) {
    try {
      let d = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions");
      let session = await d.sessions.find((item) => {
        return item.active;
      });
      let term = await session.terms.find((item) => {
        return item.active;
      });
      for (const iterator of req.body) {
        iterator.academic = [
          {
            session: session.batchname,
            class: iterator.class,
            subclass: iterator.subclass,
            term: [
              {
                name: term.term,
              },
            ],
          },
        ];
      }

      let data = await schoolModel.addStudents(req);
      if (await data) {
        res.status(200).json({
          message: "Successfully Created",
        });
      }
    } catch (error) {
      if (error.code == 11000) {
        error.message = "Email has already been taken";
      }

      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getStudents(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select(
          "-_id students._id students.first_name students.last_name students.student_id "
        )
        .sort({ _id: 1 });

      res.status(200).json({
        message: {
          data: data.students.reverse(),
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getStudent(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("students");
      let result = await data.students.id(req.headers.student_id);

      res.status(200).json({
        message: {
          data: result,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updatestudentimage(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");

      let result = await data.students.id(req.headers.id);
      let path = req.file.path;
      let object = {
        file_path: path,
        file_url: `${req.protocol}://${req.headers.host}/${path}`,
      };

      result.image = object;
      await data.save();
      res.status(200).json({
        message: "Document Successfully Uploaded",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletestudentimage(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");

      let result = await data.students.id(req.headers.id);

      fs.unlinkSync(result.image.file_path);
      result.image = undefined;
      await data.save();
      res.status(200).json({
        message: "Document Successfully deleted",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async createsession(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: 1 });

      if (req.body.active) {
        for (const iterator of data.sessions) {
          iterator.active = false;
          for (const i of iterator.terms) {
            i.active = false;
          }
        }
      }
      let checksesion = await data.sessions[data.sessions.length - 1];
      if (checksesion) {
        if (checksesion.terms.length < 3)
          throw new Error(
            "Session Can not be created Because the previous session is not completed"
          );
      }
      await data.sessions.push(req.body);
      await data.save();
      res.status(200).json({
        message: {
          data: "Add successfully",
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getsession(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: -1 });

      for (const iterator of await data.sessions) {
        iterator.terms = iterator.terms.sort((a, b) =>
          b.term > a.term ? -1 : 1
        );
      }

      res.status(200).json({
        message: {
          sessions: data.sessions,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async activatesession(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: 1 });

      for (const iterator of data.sessions) {
        iterator.active = false;
        for (const i of iterator.terms) {
          i.active = false;
        }
      }
      let newactive = await data.sessions.find((item) => {
        return item._id == req.body.id;
      });

      newactive.active = true;

      // await data.sessions.push(req.body);
      await data.save();
      res.status(200).json({
        message: "Add successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async createterm(req, res) {
    try {
      let last_term, previous_date, new_start_date, new_end_date, last_session;
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: 1 });

      let sessions = await data.sessions.find((item) => {
        return item._id == req.headers.session_id;
      });
      if (!sessions.active)
        throw new Error(
          "Term can not be created for a session that is not active"
        );
      let term = await sessions.terms.find((item) => {
        return item.term == req.body.term;
      });
      if (term) throw new Error("term already exist");
      if (req.body.active) {
        for (const iterator of sessions.terms) {
          iterator.active = false;
        }
      }
      new_start_date = new Date(req.body.startdate).getTime();
      new_end_date = new Date(req.body.enddate).getTime();

      if (new_start_date >= new_end_date)
        throw new Error("Start date can not be greater than end date");

      if (sessions.terms.length > 1) {
        last_term = sessions.terms[sessions.terms.length - 1];
        previous_date = new Date(last_term.enddate).getTime();
        1;

        if (previous_date >= new_start_date)
          throw new Error("Conflicting Date");
      } else {
        last_session = data.sessions[data.sessions.length - 2];
        if (last_session) {
          last_term = last_session.terms[last_session.terms.length - 1];
          previous_date = new Date(last_term.startdate).getTime();

          if (previous_date >= new_start_date)
            throw new Error("Conflicting Date");
        }
      }
      if (data.sessions.length > 0) {
        for (const iterator of data.sessions) {
          for (const i of iterator.terms) {
            i.finished = true;
          }
        }
      }
      await sessions.terms.push(req.body);

      await data.save();
      res.status(200).json({
        message: {
          data: "Add successfully",
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async activateterm(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: 1 });

      let sessions = await data.sessions.find((item) => {
        return item._id == req.body.session_id;
      });

      if (!sessions.active)
        throw new Error(
          "Term can not be created for a session that is not active"
        );
      for (const iterator of sessions.terms) {
        iterator.active = false;
      }
      let term = await sessions.terms.find((item) => {
        return item._id == req.body.term_id;
      });
      term.active = true;

      await data.save();
      res.status(200).json({
        message: "Term Activated successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async updatedate(req, res) {
    try {
      let last_term, previous_date, new_start_date, new_end_date, last_session;
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: 1 });

      let sessions = await data.sessions.find((item) => {
        return item._id == req.body.session_id;
      });

      if (!sessions.active)
        throw new Error(
          "Term can not be created for a session that is not active"
        );

      let term = await sessions.terms.find((item) => {
        return item._id == req.body.term_id;
      });

      // --------------------------------------------------------------
      console.log(req.body);
      new_start_date = new Date(req.body.startdate).getTime();
      new_end_date = new Date(req.body.enddate).getTime();

      if (new_start_date >= new_end_date)
        throw new Error("Start date can not be greater than end date");

      if (sessions.terms.length > 1) {
        last_term = sessions.terms[sessions.terms.length - 1];
        previous_date = new Date(last_term.enddate).getTime();

        if (previous_date >= new_start_date)
          throw new Error("Conflicting Date");
      } else {
        last_session = data.sessions[data.sessions.length - 2];
        if (last_session) {
          last_term = last_session.terms[last_session.terms.length - 1];
          previous_date = new Date(last_term.startdate).getTime();

          if (previous_date >= new_start_date)
            throw new Error("Conflicting Date");
        }
      }

      term.startdate = req.body.startdate;
      term.enddate = req.body.enddate;

      // ////////////////////////////////////////////////////////////////////////////////

      await data.save();
      res.status(200).json({
        message: "Term Updated successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deleteterm(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("sessions")
        .sort({ _id: 1 });

      let sessions = await data.sessions.find((item) => {
        return item._id == req.headers.session_id;
      });

      if (!sessions.active)
        throw new Error(
          "Term can not be Deleted for a session that is not active"
        );

      await sessions.terms.id(req.headers.term_id).remove();

      await data.save();
      res.status(200).json({
        message: "Term Deleted successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getstudentspayment(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select(
          "-_id students._id students.first_name students.last_name students.student_id students.academic"
        )
        .sort({ _id: 1 });

      res.status(200).json({
        message: {
          data: data.students.reverse(),
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getstudentpayment(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select(
          "students._id students.image students.student_id students.first_name students.email students.middle_name students.last_name students.academic"
        );
      let result = await data.students.id(req.headers.id);
      res.status(200).json({
        message: {
          data: result,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async downloadstudenttemplate(req, res) {
    try {
      res.status(200).json({
        message: [
          {
            first_name: "John",
            middle_name: "Jame",
            last_name: "Doe",
            gender: "male",
            mobile: "+234-7100000000",
            email: "example@cirportal.com",
            state: "Delta",
            class: "NURSERY ONE",
            subclass: "A",
            local_govt: "Ndokwa West",
            address: "#2 cirportal Complex",
          },
        ],
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async uploadstudentdocument(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");
      let result = await data.students.id(req.headers.id);
      let path = req.file.path;
      let object = {
        file_path: path,
        file_url: `${req.protocol}://${req.headers.host}/${path}`,
      };
      result.documents = object;

      await data.save();
      res.status(200).json({
        message: "Document Successfully Uploaded",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletestudentdocument(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");
      let result = await data.students.id(req.headers.id);
      fs.unlinkSync(result.documents.file_path);
      result.documents = {
        file_path: "",
        file_url: "",
      };
      await data.save();

      await data.save();
      res.status(200).json({
        message: "Document Successfully Uploaded",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletestudent(req, res) {
    try {
      let data = await schoolModel.findById(req.credentials._id);
      if (!data) throw new Error("school doesn't exist");

      let result = await data.students.id(req.headers.id);
      console.log(result);

      if (result.student_id != req.headers.student_id)
        throw Error("Invalid Student ID");
      if (result.image.file_path) {
        fs.unlinkSync(result.image.file_path);
      }
      if (result.documents.file_path) {
        fs.unlinkSync(result.documents.file_path);
      }
      await result.remove();
      await data.save();
      res.status(200).json({
        message: "Document Successfully deleted",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addSubject(req, res) {
    try {
      // console.log(req.credentials);
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("subjects");
      if (!data) throw new Error("school doesn't exist");
      let result = await data.subjects.find((i) => {
        return i.subject == req.body.subject || i.code == req.body.code;
      });
      if (result) throw new Error("SUbject or subject code Already Exist");

      await data.subjects.push(req.body);
      await data.save();
      res.status(200).json({
        message: "Subject added Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getSubjects(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select("subjects")
        .populate({
          path: "teachers",
        })
        .sort("-1")
        .orFail(new Error("school doesn't exist"));

      res.status(200).json({
        message: data.subjects,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getsubclass(req, res) {
    try {
      let data = await schoolModel
        .findById(req.credentials._id)
        .select(
          "students._id students.first_name students.middle_name students.student_id students.academic classes"
        )
        .sort("-1");
      if (!data) throw new Error("school doesn't exist");
      let result = await data.students.filter((i) => {
        return i.academic.every((ii) => {
          return (
            ii.session == req.headers.session &&
            ii.class == req.headers.class &&
            ii.subclass == req.headers.subclass &&
            ii.term.some((c) => {
              return c.name == req.headers.term;
            })
          );
        });
      });

      let classs = await data.classes.find((i) => {
        return i.name == req.headers.class;
      });
      let d = await classs.sub_class.find((i) => {
        return i.name == req.headers.subclass;
      });

      res.status(200).json({
        message: {
          result: result,
          subjects: d.subjects,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async assignsubject(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels subjects classes");
      let sub = await data.subjects.id(req.body.subjectid);

      let personnel = await data.personnels.id(req.body.staffid);
      let result = await data.classes.find((i) => {
        return i.name == req.body.class;
      });
      let subclass = await result.sub_class.find((i) => {
        return i.name == req.body.subclass;
      });

      let check = await subclass.subjects.find((i) => {
        return i.subject == sub.subject || i.code == sub.code;
      });
      if (check) throw new Error("Subject or code Already Exist");

      await subclass.subjects.push({
        subject: sub.subject,
        code: sub.code,
        tutor: {
          first_name: personnel.first_name,
          last_name: personnel.last_name,
          id: personnel._id,
        },
      });
      await data.save();
      res.status(200).json({
        message: "Successfully Added",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getAcademicstaff(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select(
          "_id personnels._id personnels.first_name personnels.last_name personnels.personnel_id personnels.role "
        );
      let result = await data.personnels.filter((i) => {
        return i.role == "A";
      });
      res.status(200).json({
        message: {
          data: result,
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deleteSubject(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects");

      await data.subjects.id(req.headers.id).remove();
      await data.save();
      res.status(200).json({
        message: {
          data: "Successfully Deleted",
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async editSubject(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects");

      let sub = await data.subjects.id(req.headers.id);
      sub.subject = req.body.subject;
      sub.code = req.body.code;

      await data.save();
      res.status(200).json({
        message: {
          data: "Successfully Deleted",
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addformgroup(req, res) {
    try {
      let data = await schoolModel.findOne({ _id: req.credentials._id });

      if (data.form_group) {
        let result = data.form_group.find((i) => {
          return i.name == req.body.name.toLowerCase();
        });
        if (result) throw new Error("Form Group Already Exist");
      }
      await data.form_group.push(req.body);
      await data.save();
      res.status(200).json({
        message: {
          data: "Successfully Added",
        },
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getformgroup(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("form_group");

      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deleteformgroup(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("form_group");
      await data.form_group.id(req.headers.formgroup_id).remove();
      await data.save();
      res.status(200).json({
        message: "FormGroup Deleted Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addformgroupsubject(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects form_group")
        .orFail(new Error("School not found"));

      let result = await data.form_group.id(req.body.formgroup_id);
      if (!result) throw new Error("No Form group Found");

      let getsubject = await data.subjects.id(req.body.subject_id);
      if (!getsubject) throw new Error("Subject Does not Exist");

      let checksubject = await result.subjects.find((i) => {
        return i.subject == getsubject.subject;
      });

      if (checksubject) throw new Error("Subject ALready Exist");

      await result.subjects.push(getsubject);

      await data.save();

      res.status(200).json({
        message: "Subject Added Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deleteformgroupsubject(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects form_group")
        .orFail(new Error("School not found"));

      let result = await data.form_group.id(req.body.formgroup_id);
      if (!result) throw new Error("No Form group Found");

      await result.subjects.id(req.body.subject_id).remove();

      await data.save();

      res.status(200).json({
        message: "Subject Deleted Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getformgroupitem(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("form_group._id form_group.name");

      res.status(200).json({
        message: data,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async addgrade(req, res) {
    try {
      console.log(req.body);
      if (parseInt(req.body.start_score) >= parseInt(req.body.end_score))
        throw new Error("End Score must be greater than Start score");
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("grades")
        .orFail(new Error("School not found"));
      if (await data.grades.length) {
        let result = await data.grades.find((i) => {
          return (
            i.score_title == req.body.score_title ||
            (i.start_score <= req.body.start_score &&
              req.body.start_score <= i.end_score) ||
            (i.start_score <= req.body.end_score &&
              req.body.end_score <= i.end_score)
          );
        });
        if (result)
          throw new Error(
            "Please Make sure Start score, End Score or title does not match previous record"
          );
      }

      await data.grades.push({
        start_score: parseInt(req.body.start_score),
        end_score: parseInt(req.body.end_score),
        score_title: req.body.score_title,
      });

      await data.save();

      res.status(200).json({
        message: "Grade Created  Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getgrades(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("grades")
        .orFail(new Error("School not found"));

      res.status(200).json({
        message: data.grades,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async deletegrade(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("grades")
        .orFail(new Error("School not found"));

      await data.grades.id(req.body.id).remove();

      await data.save();

      res.status(200).json({
        message: "Successfully Deleted",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async savepaystack(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("school_account")
        .orFail(new Error("School not found"));

      data.school_account.paystack_secret_key = req.body.paystack_secret_key;
      data.school_account.paystack_public_key = req.body.paystack_public_key;

      await data.save();

      res.status(200).json({
        message: "Saved Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async saveremita(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("school_account")
        .orFail(new Error("School not found"));

      data.school_account.remita_secret_key = req.body.remita_secret_key;
      data.school_account.remita_public_key = req.body.remita_public_key;
      await data.save();

      res.status(200).json({
        message: "Saved Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getaccounts(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("school_account")
        .orFail(new Error("School not found"));
      res.status(200).json({
        message: data.school_account,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async saveemail(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("email_setting")
        .orFail(new Error("School not found"));

      data.email_setting = req.body;

      await data.save();

      res.status(200).json({
        message: "Saved Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getemailsetting(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("email_setting")
        .orFail(new Error("School not found"));
      res.status(200).json({
        message: data.email_setting,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async teachers(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels")
        .orFail(new Error("School not found"));
      let result = data.personnels.filter((i) => {
        return i.role == "teachers";
      });
      res.status(200).json({
        message: result,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async tagTeachers(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects")
        .orFail(new Error("School not found"));

      let subjects = await data.subjects.find(
        (i) => i._id == req.body.subjectId
      );
      if (!subjects) throw new Error("Subject does not Exist");
      for (const iterator of req.body.teachersId) {
        subjects.teachers.push(iterator);
      }
      await data.save();
      res.status(200).json({
        message: "Tag Successful",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async untagTeachers(req, res) {
    try {
      let data = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("subjects")
        .orFail(new Error("School not found"));

      let subjects = await data.subjects.id(req.body.subjectId);
      if (!subjects) throw new Error("Subject does not Exist");
      let a = subjects.teachers.filter((i) => i != req.body.teacherId);
      subjects.teachers = a;
      await data.save();
      res.status(200).json({
        message: "Untag Successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async currentTeachers(req, res) {
    try {
      // let data = await schoolModel
      //   .findOne({ _id: req.credentials._id })
      //   .select("personnnels")
      //   .orFail(new Error("School not found"));

      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("personnels")
        .orFail(new Error("School not found"));

      let currentteachers = await dat.personnels.filter((i) => {
        return req.body.ids.some((ii) => {
          return ii == i._id;
        });
      });

      res.status(200).json({
        message: currentteachers,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async requestLeave(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves")
        .orFail(new Error("School not found"));
      console.log(dat, req.body);

      if (dat.leaves.length) {
        let current = dat.leaves.find((i) => {
          return i.personnel_id == req.body.personnel_id && i.status == null;
        });
        if (current) throw new Error("You currently have a pending request");
      }

      let currentdate = new Date();
      currentdate.setDate(currentdate.getDate() + 5);
      // currentdate = parseDate(currentdate).getTime();
      currentdate = new Date(currentdate).getTime();
      let startdate = new Date(req.body.start_date).getTime();
      let enddate = new Date(req.body.end_date).getTime();

      if (startdate <= currentdate)
        throw new Error("Leave Must be requested 7days before start date");
      if (enddate <= startdate) throw new Error("Invalid End Date");

      dat.leaves.push(req.body);

      await dat.save();

      res.status(200).json({
        message: "leave submited successfully",
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getPersonnelLeave(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves")
        .orFail(new Error("School not found"));

      let personnelleave = await dat.leaves.filter((i) => {
        return i.personnel_id == req.headers.personnel_id;
      });

      res.status(200).json({
        message: personnelleave.reverse(),
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getAllLeaves(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves personnels")
        .orFail(new Error("School not found"));

      let returnleave = [];
      for (const iterator of dat.leaves) {
        let person = dat.personnels.id(iterator.personnel_id);

        let newobject = {
          end_date: iterator.end_date,
          start_date: iterator.start_date,
          reason: iterator.reason,
          status: iterator.status,
          _id: iterator._id,
          first_name: person.first_name,
          last_name: person.last_name,
        };
        returnleave.push(newobject);
      }

      res.status(200).json({
        message: returnleave.reverse(),
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async approveLeave(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves")
        .orFail(new Error("School not found"));

      let personnelleave = await dat.leaves.id(req.body.id);
      personnelleave.status = true;
      await dat.save();

      dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves personnels")
        .orFail(new Error("School not found"));

      let returnleave = [];
      for (const iterator of dat.leaves) {
        let person = dat.personnels.id(iterator.personnel_id);

        let newobject = {
          end_date: iterator.end_date,
          start_date: iterator.start_date,
          reason: iterator.reason,
          status: iterator.status,
          _id: iterator._id,
          first_name: person.first_name,
          last_name: person.last_name,
        };
        returnleave.push(newobject);
      }

      res.status(200).json({
        message: "Successfully approved",
        data: returnleave.reverse(),
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async declineLeave(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves")
        .orFail(new Error("School not found"));

      let personnelleave = await dat.leaves.id(req.body.id);

      personnelleave.status = false;

      await dat.save();

      dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("leaves personnels")
        .orFail(new Error("School not found"));

      let returnleave = [];
      for (const iterator of dat.leaves) {
        let person = dat.personnels.id(iterator.personnel_id);

        let newobject = {
          end_date: iterator.end_date,
          start_date: iterator.start_date,
          reason: iterator.reason,
          status: iterator.status,
          _id: iterator._id,
          first_name: person.first_name,
          last_name: person.last_name,
        };
        returnleave.push(newobject);
      }

      res.status(200).json({
        message: "Leave has been decline",
        data: returnleave.reverse(),
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async getstudentDetails(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("students")
        .orFail(new Error("School not found"));

      let students = await dat.students.id(req.credentials.student_id);
      if (!students) throw new Error("Student not found");

      res.status(200).json({
        data: students,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
  static async paymentverify(req, res) {
    try {
      let dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("school_account students")
        .orFail(new Error("School not found"));

      const ref = req.body.reference;
      let output;
      await axios
        .get(`https://api.paystack.co/transaction/verify/${ref}`, {
          headers: {
            authorization: `Bearer ${dat.school_account.paystack_secret_key}`,
            //replace TEST SECRET KEY with your actual test secret
            //key from paystack
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        })
        .then((success) => {
          output = success;
        })
        .catch((error) => {
          output = error;
        });
      if (!output.data.status) throw new Error("Transaction is not verified");
      let student = await dat.students.id(req.credentials.student_id);
      if (!student) throw new Error("Student not found");
      await student.wallet.push({
        transaction_id: output.data.data.id,
        ip_address: output.data.data.ip_address,
        currency: output.data.data.currency,
        channel: output.data.data.channel,
        domain: output.data.data.domain,
        reference: output.data.data.reference,
        transaction_date: output.data.data.transaction_date,
        paid_at: output.data.data.paid_at,
        amount: output.data.data.amount / 100,
      });
      await dat.save();
      dat = await schoolModel
        .findOne({ _id: req.credentials._id })
        .select("students")
        .orFail(new Error("School not found"));
      student = await dat.students.id(req.credentials.student_id);
      res.status(200).json({
        message: "Payment Success",
        data: student,
      });
    } catch (error) {
      res.status(302).json({
        error: error.message,
      });
    }
  }
};
