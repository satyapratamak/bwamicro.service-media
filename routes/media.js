const express = require('express');
const router = express.Router();
const {PORT} = process.env;
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const {Media} = require('../models');
const fs = require('fs'); // filesystem


/** GET List Image **/
//router.get('/',)
router.get('/', async(req, res)=>{
  const media = await Media.findAll({
    attributes: ['id','image'],
  });

  const mappedMedia = media.map((m) =>{
    m.image = `${req.get('host')}/${m.image}`;
    return m;
  });

  return res.json({
    status : "success",
    data : mappedMedia,
  });
});


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

        const media = await Media.create({image:`images/${filename}`});

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

/** DELETE Image **/
router.delete('/:id', async(req, res) => {
  const id = req.params.id;
  

  const media = await Media.findByPk(id);

  if(!media){
    // Media not found
    return res.status(404).json(
      {status:"Error", message: 'Media not found'}
    );
  }else{
    // Media found in database
    // Delete from file system and from database

    // Delete image from file systems
    fs.unlink(`./public/${media.image}`, async (err) => {
      if (err){
        return res.status(400).json({ status : "Error", message : err.message
        });
      }
      
    });

    await media.destroy();

    return res.json({
      status : "Success",
      message : "Image has been deleted successfully",
    });

  }
});

module.exports = router;
