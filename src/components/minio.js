var Minio = require("minio");

var minioClient = new Minio.Client({
  endPoint: process.env.REACT_APP_SERVER_IP,
  port: 9000,
  useSSL: false,
  accessKey: '0e3Logy2GLyQp08a',
  secretKey: 'jZxtOXB4UKl8nqgvZASYkXk3XqpCq7Hk'
});

// var minioClient = new Minio.Client({
//   endPoint: 'canvas.iiit.ac.in',
//   useSSL: true,
//   accessKey: 'minioadmin',
//   secretKey: 'Minio@0710'
// });

var minioBucket = process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_MINIO_BUCKET_DEV : process.env.REACT_APP_MINIO_BUCKET_PROD
export {minioClient, minioBucket}
