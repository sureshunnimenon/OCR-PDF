const express = require('express');
const app = express();

const fs = require('fs');

const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();

// worker
//   .recognize('http://jeroen.github.io/images/testocr.png')
//   .progress((p) => {
//     console.log('progress', p);
//   })
//   .then(({ text }) => {
//     console.log(text);
//     worker.terminate();
//   });


// declared storates
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
    
});

const upload = multer({storage: storage}).single("avatar");

// declared view engine as ejs

app.set("view engine",'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/upload', (req, res) => {
    // res.send('upload started!')
    upload(req, res, err => {
        console.log(req.file)
        fs.readFile(`./uploads/${req.file.originalname}`, (err,data) => {
            if (err) console.log("there issome error")

            worker.recognize(data, "eng", {tessjs_create_pdf: 1})
                .progress(progress => {
                    console.log(progress)
                })
                .then(result => {
                    // res.send(result.text);
                    res.redirect('/download')
                    worker.terminate()
                })
                
        })
    })
});

app.get('/download', (req,res) => {
    const file = `${__dirname}/eng.traineddata`;
    res.download(file)
})

const PORT = 5000 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})