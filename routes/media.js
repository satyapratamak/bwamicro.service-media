const express = require('express');
const router = express.Router();
const {PORT} = process.env;
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const {Media} = require('../models');

/* POST image listing. */
router.post('/', function(req, res){
  const image = req.body.image;

  if(!isBase64(image, {mimeRequired : true})){
    return res.status(400).json({status : 'Bad Request', message : 'Invalid base64'});
  }else{
   
    base64Img.img(image, './public/images', Date.now(), async (err, filepath) =>{
      // Using async because asynchronous function of await Media
      if(err){
        // Error while saving image to destination directory
        return res.status(400).json({status: 'Error', message:"Error while saving image..Please retry for a while.."});
      }else{
        // Not Error
        // while have callback variable named filepath
        // Example filepath format : /public/images/23423423049.png

        // Save the file name to Database
        const filename = filepath.split("\\").pop().split("/").pop(); // split filepath with backslash character and get the last element  for Windows
        //const filename = filepath.split("/").pop(); // for UNIX platforms

        const media = await Media.create({image:`image/${filename}`});

        return res.json({
          status : 'success',
          data : {
            id : media.id,
            images : `${req.get('host')}/images/${filename}`,
          },
        });
      }       

      
    });

    // 
  }
});

module.exports = router;
