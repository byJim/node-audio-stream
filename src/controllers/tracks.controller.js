const { GridFSBucket, ObjectID } = require("mongodb");
const { getConnection } = require('../database.js');
const { Readable } = require('stream');
const multer = require('multer')


const getTracks = (req, res) => {
    let trackID;

    try {
        trackID = new ObjectID(req.params.trackID);
    }catch (error){
        return res.status(400).json({message:'Invalid track ID in url'})
    }
    console.log(trackID);

    //Set content type
    res.set('content-type','audio/mp3');
    res.set('accept-ranges','bytes');

    //Consul the database
    const db = getConnection()
    let bucket = new GridFSBucket(db, {
        bucketName: 'tracks'
    });

    let downloadStream = bucket.openDownloadStream(trackID);

    downloadStream.on('data', chunk => {
        res.write(chunk);
    });

    downloadStream.on('error', () =>{
        res.sendStatus(404);
    });

    downloadStream.on('end', () =>{
        res.end();
    });
};

const uploadTracks = (req, res) =>{
    const storage = multer.memoryStorage();
    const upload = multer({
        storage,
        limits:{
            field: 1,
            fileSize: 6000000,
            files:1,
            parts:2
            }
        }
    );

    upload.single('track')(req, res, (err) => {

        //We'll handle the mistakes.
        if (err) {
            console.log(err)
            return res.status(400).json({message: err.message});
        } else if (!req.body.name){
            return res.status(400).json({message: 'No track name in body req'});
        }

        let trackName =  req.body.name;

        const readableTrackStream = new Readable();
        readableTrackStream.push(req.file.buffer);
        readableTrackStream.push(null);

        const db = getConnection();
        let bucket = new GridFSBucket(db, {
            bucketName: 'tracks'
        });

        let uploadStream = bucket.openUploadStream(trackName);

        let id = uploadStream.id;
        readableTrackStream.pipe(uploadStream);

        uploadStream.on('error', () => {
            return res.status(500).json({message: 'Error uploading yur file'});
        });

        uploadStream.on('finish', () => {
            return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
        });
    })

}

module.exports = {
    getTracks,
    uploadTracks
}
