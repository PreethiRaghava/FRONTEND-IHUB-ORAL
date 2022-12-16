var Minio = require("minio");

var minioClient = new Minio.Client({
  endPoint: process.env.REACT_APP_MINIO_ACCESS_IP,
  port: parseInt(process.env.REACT_APP_MINIO_ACCESS_PORT),
  useSSL: false,
  accessKey: process.env.REACT_APP_MINIO_ACCESS_KEY,
  secretKey: process.env.REACT_APP_MINIO_ACCESS_SECRET
});

// var minioClient = new Minio.Client({
//   endPoint: 'canvas.iiit.ac.in',
//   useSSL: true,
//   accessKey: 'minioadmin',
//   secretKey: 'Minio@0710'
// });

var minioBucket = process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_MINIO_BUCKET_DEV : process.env.REACT_APP_MINIO_BUCKET_PROD
export {minioClient, minioBucket}
