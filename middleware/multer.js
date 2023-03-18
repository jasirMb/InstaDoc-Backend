const multer = require('multer');

const storage = multer.diskStorage({
  // configuration for disk storage
  destination: function (req, file, cb) {
    cb(null, 'public/records')
  },
  filename: function (req, file, cb) {
    console.log(file);
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.')
      
    )
    console.log(ext);
    cb(null,  file.originalname + '-' + Date.now() + ext)
  }
});

 

const upload = multer({
  storage: storage,
});

module.exports = upload;