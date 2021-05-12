const fs = require("fs");
dir = "schooldocuments";
// imagedir = 'upload/images',
// videodir = 'upload/videos',
// thumbnaildir = 'upload/thumbnail';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
  // fs.mkdirSync(imagedir);
  // fs.mkdirSync(videodir);
  // fs.mkdirSync(thumbnaildir);
}
const // importing
  express = require("express"),
  schoolRouter = express.Router(),
  school = require("../../middleware/school/school"),
  role = require("../../middleware/role/role"),
  multer = require("multer"),
  auth = require("../../auth/auth");
(storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "schooldocuments/");
  },
  filename: function (req, file, cb) {
    let name = `${file.fieldname}_${Date.now()}.${file.originalname}`;
    cb(null, name);
    req.headers.name = name;
  },
})),
  (upload = multer({ storage: storage }));

// create school
schoolRouter.post("/", school.createNewSchool);
schoolRouter.post("/addschools", school.createNewSchools);
//update school
schoolRouter.post("/updateschoolinfo", school.updateschoolinfo);
schoolRouter.post("/updateschoolaccount", school.updateschoolaccount);
schoolRouter.post(
  "/uploaddocument",
  upload.single("file"),
  school.uploadcacdocument
);
schoolRouter.post(
  "/editdocument",
  upload.single("file"),
  school.editcacdocument
);
schoolRouter.post(
  "/schoollogo",
  upload.single("schoollogo"),
  school.uploadschoollogo
);
schoolRouter.delete("/deletedocument", school.deletecacdocument);
//school excel template
schoolRouter.get("/exceltemplate", school.downloadschooltemplate);
//get all schools
schoolRouter.get("/", school.getAllSchools);
//get individual school
schoolRouter.get("/details", school.getSchoolDetails);
schoolRouter.post("/addclass", auth.adminauth, school.addclass);
schoolRouter.post("/deletesubclass", auth.adminauth, school.deletesubclass);
schoolRouter.get("/getclasses", auth.adminauth, school.getclasses);
schoolRouter.get("/getAllclasses", auth.adminauth, school.getAllclasses);
schoolRouter.get("/getclassDetails", auth.adminauth, school.getclassDetails);
schoolRouter.get("/fee-setting", auth.adminauth, school.getfeesetting);
// school login
schoolRouter.post("/adminlogin", school.adminlogin);
schoolRouter.post("/addsession", auth.adminauth, school.createsession);
schoolRouter.post("/addterm", auth.adminauth, school.createterm);
schoolRouter.get("/getSession", auth.adminauth, school.getsession);
schoolRouter.post("/activatesession", auth.adminauth, school.activatesession);
schoolRouter.post("/activateterm", auth.adminauth, school.activateterm);
schoolRouter.post("/updatedate", auth.adminauth, school.updatedate);
schoolRouter.delete("/deleteterm", auth.adminauth, school.deleteterm);

// create personnel
schoolRouter.post("/addpersonnel", auth.adminauth, school.addPersonnel);
schoolRouter.post(
  "/addguarantor",
  auth.adminauth,
  school.addpersonnelguarantor
);
schoolRouter.post("/addPersonnels", auth.adminauth, school.addPersonnels);
schoolRouter.post("/addsubclass", auth.adminauth, school.addsubclass);
//personnel excel template
schoolRouter.get("/personneltemplate", school.downloadpersonneltemplate);
// get all personnels
schoolRouter.get("/getpersonnels", auth.adminauth, school.getPersonnels);
schoolRouter.get("/getpersonnel", auth.adminauth, school.getPersonnel);
schoolRouter.post("/requestleave", auth.adminauth, school.requestLeave);
schoolRouter.get("/personnelleaves", auth.adminauth, school.getPersonnelLeave);
schoolRouter.get("/allleaves", auth.adminauth, school.getAllLeaves);
schoolRouter.post("/approveleave", auth.adminauth, school.approveLeave);
schoolRouter.post("/declineleave", auth.adminauth, school.declineLeave);
schoolRouter.post(
  "/activatepersonnel",
  auth.adminauth,
  school.activatePersonnel
);
schoolRouter.post(
  "/updateaccount",
  auth.adminauth,
  school.updatePersonnelAcoount
);
schoolRouter.post(
  "/deactivatepersonnel",
  auth.adminauth,
  school.deactivatePersonnel
);
// update personnel image
schoolRouter.post(
  "/personnelimage",
  auth.adminauth,
  upload.single("profileimage"),
  school.updatepersonnelimage
);
schoolRouter.delete(
  "/personnelimage",
  auth.adminauth,
  school.deletepersonnelimage
);
schoolRouter.post(
  "/verify-email-settings",
  auth.adminauth,
  school.verifyEmailSettings
);
schoolRouter.post(
  "/personneldocument",
  auth.adminauth,
  upload.single("document"),
  school.uploadpersonneldocument
);
schoolRouter.delete(
  "/personneldocument",
  auth.adminauth,
  school.deletepersonneldocument
);

// delete personnel
schoolRouter.delete("/deletepersonnel", auth.adminauth, school.deletepersonnel);

// school session

// school student
schoolRouter.post("/addstudent", auth.adminauth, school.addStudent);
schoolRouter.post(
  "/changeguardian",
  auth.adminauth,
  school.updateStudentGuardian
);
schoolRouter.post("/editstudent", auth.adminauth, school.updateStudentInfo);
// get all students
schoolRouter.get("/getstudents", auth.adminauth, school.getStudents);
schoolRouter.get("/getstudent", auth.adminauth, school.getStudent);
// update student image
schoolRouter.post(
  "/studentimage",
  auth.adminauth,
  upload.single("profileimage"),
  school.updatestudentimage
);
schoolRouter.delete("/studentimage", auth.adminauth, school.deletestudentimage);
schoolRouter.get(
  "/getstudentspayment",
  auth.adminauth,
  school.getstudentspayment
);
schoolRouter.get(
  "/getstudentpayment",
  auth.adminauth,
  school.getstudentpayment
);
schoolRouter.post("/addStudents", auth.adminauth, school.addStudents);
// update student
schoolRouter.get("/studenttemplate", school.downloadstudenttemplate);
schoolRouter.post(
  "/studentdocument",
  auth.adminauth,
  upload.single("document"),
  school.uploadstudentdocument
);
schoolRouter.delete(
  "/studentdocument",
  auth.adminauth,
  school.deletestudentdocument
);
schoolRouter.delete("/deletestudent", auth.adminauth, school.deletestudent);
schoolRouter.post("/subject", auth.adminauth, school.addSubject);
schoolRouter.get("/subjects", auth.adminauth, school.getSubjects);
schoolRouter.get("/getsubclass", auth.adminauth, school.getsubclass);
schoolRouter.post("/assignsubject", auth.adminauth, school.assignsubject);
schoolRouter.get("/getAcademicstaff", auth.adminauth, school.getAcademicstaff);
schoolRouter.delete("/deleteSubject", auth.adminauth, school.deleteSubject);
schoolRouter.post("/editSubject", auth.adminauth, school.editSubject);
schoolRouter.post("/role", role.addrole);
schoolRouter.get("/roles", role.getroles);
schoolRouter.post("/addformgroup", auth.adminauth, school.addformgroup);
schoolRouter.get("/getformgroup", auth.adminauth, school.getformgroup);

schoolRouter.delete("/deleteformgroup", auth.adminauth, school.deleteformgroup);
schoolRouter.get("/getformgroupitem", auth.adminauth, school.getformgroupitem);
schoolRouter.post(
  "/addformgroupsubject",
  auth.adminauth,
  school.addformgroupsubject
);
schoolRouter.post(
  "/deleteformgroupsubject",
  auth.adminauth,
  school.deleteformgroupsubject
);
schoolRouter.post("/addgrade", auth.adminauth, school.addgrade);
schoolRouter.get("/getgrades", auth.adminauth, school.getgrades);
schoolRouter.post("/deletegrades", auth.adminauth, school.deletegrade);

schoolRouter.get("/getaccounts", auth.adminauth, school.getaccounts);
schoolRouter.post("/savepaystack", auth.adminauth, school.savepaystack);
schoolRouter.post("/saveremita", auth.adminauth, school.saveremita);

schoolRouter.post("/saveemail", auth.adminauth, school.saveemail);
schoolRouter.get("/getemailsetting", auth.adminauth, school.getemailsetting);
schoolRouter.post(
  "/verifycredential",
  auth.adminauth,
  school.verify_credential
);
schoolRouter.get("/teachers", auth.adminauth, school.teachers);
schoolRouter.post("/currentteachers", auth.adminauth, school.currentTeachers);
schoolRouter.post("/tagnewteacher", auth.adminauth, school.tagTeachers);
schoolRouter.post("/untagnewteacher", auth.adminauth, school.untagTeachers);

schoolRouter.post("/add-fee-setting", auth.adminauth, school.addfeesetting);
schoolRouter.post("/edit-fee-setting", auth.adminauth, school.editfeesetting);
schoolRouter.post(
  "/delete-fee-setting",
  auth.adminauth,
  school.deletefeesetting
);
schoolRouter.post("/student-login", school.studentlogin);
schoolRouter.get("/student-details", auth.adminauth, school.getstudentDetails);
schoolRouter.post("/payment-verify", auth.adminauth, school.paymentverify);

module.exports = schoolRouter;
