const multer = require('multer');

const storage = multer.diskStorage({
  // configuration for disk storage
  destination: function (req, file, cb) {
    cb(null, 'public/records')
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.')
    )
    cb(null,  file.fieldname + '-' + Date.now() + ext)
  }
});

 

const upload = multer({
  storage: storage,
});

module.exports = upload;